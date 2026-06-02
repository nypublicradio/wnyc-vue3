// Dynamic import for OneSignal - only loads on client side to avoid SSR errors
let OneSignal: any = null
const loadOneSignal = async () => {
  if (typeof window === 'undefined') return null // Server-side guard
  if (OneSignal) return OneSignal // Already loaded
  try {
    const module = await import('onesignal-cordova-plugin')
    OneSignal = module.default
    return OneSignal
  } catch (error) {
    console.error('Failed to load OneSignal:', error)
    return null
  }
}

import {
  useCurrentUserProfile,
  useCurrentUser,
  useSettingSideBar,
  useIsNativeApp,
  useGlobalToast,
  useIsNetworkConnected,
  useMasterNotificationChannelsArray,
  getMasterNotificationChannels
} from "~/composables/states"
import {
  trackClickEvent,
  getPathAndQuery,
  toSystemSettings,
} from "~/utilities/helpers"
import { cancelAllPendingLocalNotifications, setPendingLocalNotifications, usePendingLocalNotifications } from "~/utilities/local-notifications"
import { ref } from "vue"
import { doActionId, doTrigger } from "~/server/utils/oneSignalNotificationCustomActions"
import { Capacitor } from "@capacitor/core"
import { LocalNotifications } from "@capacitor/local-notifications"
import { useAuthReturnRoute } from "./useAuthReturnRoute"

// shared state for in-app notification
export const isInAppNotificationActive = ref(false)

// base OneSignal composable
export default function useOneSignal () {

  let oneSignalSubscriptionId: string = null
  let oneSignalId: string = null

  const isNativeApp = useIsNativeApp()
  const masterNotificationChannelsArray = useMasterNotificationChannelsArray()
  const router = useRouter()

  // toggle users notifications channel tags
  const toggleOneSignalUserTag = async (channelKey: string, value: boolean) => {
    if (!isNativeApp.value) return
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    await OneSignal.User.addTag(channelKey, String(value))
  }

  // function to handle the click actions of the notifications
  const handleAppNotificationUrlOpen = (event) => {
    const url = event.result?.url
    const action = event.result?.actionId
    const settingSideBar = useSettingSideBar()
    // if settingSideBar is open, close it
    if (settingSideBar.value) settingSideBar.value = false
    if (url) {
      if (!url.includes("https://")) {


        // deep link
        const route = getPathAndQuery(url)

        trackClickEvent(
          "Deep link",
          "Notification",
          `url = ${url}`
        )
        // slight delay needed for a cold start, or it will route home after the notification route
        setTimeout(async () => {
          await navigateTo(route)
        }, 1000)
        return
      } else {
        // if the url is a link to a web page, then open it in a new tab
        trackClickEvent(
          "Link",
          "Notification",
          `url = ${url}`
        )
        window.open(url, "_blank")
      }
    }

    // action from the notification
    if (action) {
      // I would imagine that we would set and share action IDs to the team and react accordingly here
      trackClickEvent(
        "Action",
        "Notification",
        `action = ${action}`
      )
      doActionId(action)
    }
  }

  const handleAppUrlOpen = async (event) => {
    // if settingSideBar is open, close it
    const settingSideBar = useSettingSideBar()
    if (settingSideBar.value) settingSideBar.value = false

    const urlObj = new URL(event.url)

    //if the url has a query var "code" then we need to exchange it for a session
    const sessionCode = urlObj.searchParams.get("code")
    if (sessionCode) {
      //when redirected to the app from a apple or google auth, we need to exchange the url param code for a session
      const code = event.url.split("=")[1]
      // for some reason, sometimes, the code has a '#' at the end of it, so we need to remove it
      const cleanCode = code.replace("#", "")

      const client = useSupabaseClient()
      const globalToast = useGlobalToast()
      const { getAuthReturnRoute, clearAuthReturnRoute } = useAuthReturnRoute()
      const theReturnRoute = await getAuthReturnRoute()
      try {
        await client.auth.exchangeCodeForSession(cleanCode)

        await router.push(theReturnRoute || "/")
        clearAuthReturnRoute()
        setTimeout(() => {
          window.location.reload()
        }, 200)
        return
      } catch (error) {
        console.error(error)
        globalToast.value = {
          severity: "error",
          summary: "Authentication failed",
          life: 6000,
        }
        return
      }
    }

    // check if the url has the query actionid to support actionId's from any links in the appUrlProtocolsArr global array
    const actionId = urlObj.searchParams.get("actionid")
    if (actionId) {
      trackClickEvent(
        "Action",
        "app opened from link",
        `action = ${actionId}, url = ${event.url}`
      )
      doActionId(actionId)
    }

    // check if the url has the query trigger to support triggers's from  any links in the appUrlProtocolsArr global array
    const trigger = urlObj.searchParams.get("trigger")
    const triggerValue = urlObj.searchParams.get("triggervalue") ?? "true"
    if (trigger) {
      trackClickEvent(
        "In-App Trigger",
        "app opened from link",
        `trigger = ${trigger}, url = ${event.url}`
      )
      doTrigger(trigger, triggerValue)
    }

    // route to the url deep link if it is NOT the root url
    // remove trailing slashes from the url
    const normalizedPathname = urlObj.pathname.replace(/\/+$/, "")
    const isIndexPath = normalizedPathname === ""
    if (!isIndexPath) {
      const route = getPathAndQuery(event.url)

      trackClickEvent(
        "Deep link",
        "app opened from link",
        `url = ${event.url}`
      )
      // slight delay needed for a cold start, or it will route home after the notification route
      setTimeout(async () => {
        await navigateTo(route)
      }, 1000)
    }
  }

  // function to set the salesforce_id in OneSignal as a user tag
  const setSalesForceId = async () => {
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    const tags = await OneSignal.User.getTags()

    // if the salesforce_id is already set as a user tag, then return
    if (tags.salesforce_id) return

    const currentUser = useCurrentUser()
    const client = useSupabaseClient()
    const { data: profile } = await client
      .from("profiles")
      .select("salesforce_id")
      .eq("id", currentUser.value.id)
      .single()

    // if the salesforce_id is set, then update OneSignal with the salesforce_id
    const salesforceId = profile.salesforce_id
    if (salesforceId) {
      await OneSignal.User.addTags({ "salesforce_id": salesforceId })
      await OneSignal.User.addAlias("salesforce_id", salesforceId)
    }
  }

  // function to set the OneSignal ID in Supabase profile
  const setOneSignalId = async () => {
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    const currentUser = useCurrentUser()
    oneSignalId = await OneSignal.User.getOnesignalId()

    const client = useSupabaseClient()
    await client
      .from("profiles")
      .update({
        onesignal_id: oneSignalId,
      })
      .match({ id: currentUser.value.id })
  }

  // function to set the OneSignal subscriptions in Supabase profile
  const setSubscriptions = async () => {
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    const currentUser = useCurrentUser()
    // update Supabase profile with oneSignalSubscriptionId (push to array)
    const client = useSupabaseClient()
    const { data: profile } = await client
      .from("profiles")
      .select("one_signal_subscription_ids")
      .eq("id", currentUser.value.id)
      .single()

    oneSignalSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync()

    const subscriptionIds: Array<string> = profile.one_signal_subscription_ids || []

    if (!subscriptionIds.includes(oneSignalSubscriptionId)) {
      subscriptionIds.push(oneSignalSubscriptionId)

      await client
        .from("profiles")
        .update({
          one_signal_subscription_ids: subscriptionIds,
        })
        .match({ id: currentUser.value.id })
    }
  }

  // triggered when the listener for Notifications "click" is called
  const notificationClickListener = function (event) {
    handleAppNotificationUrlOpen(event)
  }

  // triggered when the listener for InAppMessages "didDisplay" is called isInAppNotificationActive to true
  const inAppNotificationDidDisplay = function () {
    isInAppNotificationActive.value = true

  }
  // triggered when the listener for InAppMessages "didDismiss" is called isInAppNotificationActive to false
  const inAppNotificationDidDismiss = function () {
    isInAppNotificationActive.value = false
  }

  // triggered when the listener for InAppMessages "click" is called
  const inAppNotificationClickListener = function (event) {
    handleAppNotificationUrlOpen(event)
  }

  // function to check the permissions for notifications
  const checkPermissions = async () => {
    if (isNativeApp.value) {
      const OneSignal = await loadOneSignal()
      if (!OneSignal) return false
      return await OneSignal.Notifications.getPermissionAsync()
    } else {
      return false
    }
  }

  // triggered when the listener for permissionChange is called
  const updateNotificationSetting = async () => {
    const currentUserProfile = useCurrentUserProfile()
    const accepted = await checkPermissions()
    // set profile to receive_general_notifications based on accepted
    currentUserProfile.value.receive_general_notifications = accepted
  }

  // triggered when the listener for permissionChange is called
  const notificationPermissionSync = async (accepted?: boolean) => {
    const isNetworkConnected = useIsNetworkConnected()
    if (!isNetworkConnected.value) return
    await nextTick()
    const globalToast = useGlobalToast()
    const currentUserProfile = useCurrentUserProfile()
    const pendingLocalNotifications = await LocalNotifications.getPending()

    const currentSystemNotificationPermission = currentUserProfile.value.receive_general_notifications

    // function to alert the user and pass in the summary
    const alertUser = (summary) => {
      globalToast.value = {
        severity: "warn",
        summary,
        //life: 6000,
        closable: true,
      }
    }

    // if accepted is not defined, then check the permissions
    if (accepted === undefined) {
      accepted = await checkPermissions()
    }


    // ANDROID:  if system notification are off, then cancel all pending notifications if any exist and inform the user
    if (!accepted && Capacitor.getPlatform() === "android") {
      if (pendingLocalNotifications.notifications.length > 0) {

        cancelAllPendingLocalNotifications(pendingLocalNotifications)

        alertUser("Notifications are off. All scheduled live show notifications have been cancelled")
      }
    }

    // iOS: iOS does not allow access to the scheduled local notifications when the system notifications are off, so we can't cancel them when they turn them back on.

    // if the system notification permission has been turned off, then inform the user
    if (Capacitor.getPlatform() === "ios") {

      if (!accepted) {
        const pendingLocalNotificationsState = usePendingLocalNotifications()
        if (pendingLocalNotificationsState.value.notifications.length > 0) {
          //alert the user
          alertUser("Notifications are off. All scheduled live show notifications have been cancelled")
        }
        // clears pendingLocalNotificationsState.value.notifications = []
        setPendingLocalNotifications()
      }

      // check if the user has changed the system notification permission from OFF to ON
      if (!currentSystemNotificationPermission && accepted) {
        // check if there are any pending plugin local notifications
        if (pendingLocalNotifications.notifications.length > 0) {
          // now cancel them, because they are now available to cancel
          cancelAllPendingLocalNotifications(pendingLocalNotifications)
        }
      }
    }

    // set profile to receive_general_notifications based on accepted
    currentUserProfile.value.receive_general_notifications = accepted
  }

  // const pushSubscriptionListener = (event) => {
  //   console.log("Push subscription changed: ", event);
  // };

  // triggered when the listener for User "change" is called
  const userListener = () => {
    setOneSignalId()
  }

  // function to initialize OneSignal
  async function initOneSignal () {
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    const config = useRuntimeConfig()
    //await OneSignal.Debug.setLogLevel(6);
    await OneSignal.setConsentRequired(false)
    await OneSignal.setConsentGiven(true)
    await OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)
    await OneSignal.InAppMessages.setPaused(false)

    //await OneSignal.Notifications.addEventListener("foregroundWillDisplay", notificationAboutToDisplay);

    await OneSignal.Notifications.addEventListener("click", notificationClickListener)

    await OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)

    //await OneSignal.InAppMessages.addEventListener("willDisplay", inAppNotificationDidDisplay);
    await OneSignal.InAppMessages.addEventListener("didDisplay", inAppNotificationDidDisplay)
    //await OneSignal.InAppMessages.addEventListener("willDismiss", inAppNotificationDidDismiss);
    await OneSignal.InAppMessages.addEventListener("didDismiss", inAppNotificationDidDismiss)

    // listener for when the user changes the notification permissions at the OS level
    await OneSignal.Notifications.addEventListener("permissionChange", () => {
      // delay added so the notificationPermissionSync can detect that the change before it happens. This is so Ios can detect that the notification were OFF before they were turned ON
      setTimeout(() => {
        updateNotificationSetting()
      }, 1500)
    })

    //await OneSignal.User.pushSubscription.addEventListener("change", pushSubscriptionListener)

    await OneSignal.User.addEventListener("change", userListener)
  }

  // function to trigger the OS permission request
  async function requestNotificationPermission () {
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    await OneSignal.Notifications.canRequestPermission().then(async (canRequest) => {
      // if the user can request permission, request it, otherwise send them to the system settings to change it manually
      canRequest ? await OneSignal.Notifications.requestPermission(true).then(async (accepted: boolean) => {
        if (!accepted) {
          // they deny after being asked for permission
          // resync the setting tabs
          await notificationPermissionSync()
        }
      }) : toSystemSettings()
    })
  }

  // syncMasterNotificationChannels with the user's profile, supabase and oneSignal
  function syncMasterNotificationChannels (local, master) {
    const safeMaster = Array.isArray(master) ? master : []

    if (!Array.isArray(local.one_signal_notification_channels)) {
      local.one_signal_notification_channels = []
    }

    // Keep the user's current channel values by key, then rehydrate from master.
    // This preserves user preferences while allowing master labels/metadata to update.
    const localValueByKey = local.one_signal_notification_channels.reduce((acc, channel) => {
      acc[channel.key] = channel.value
      return acc
    }, {})

    // Update data.one_signal_notification_channels based on masterNotificationChannelsArray. This is to ensure that the user's notification channels are always in sync on Supabase & oneSignal user tags with the masterNotificationChannelsArray if they are updated/changed

    // Rebuild from master so only valid channels remain, but preserve local user value when available.
    local.one_signal_notification_channels = safeMaster.map((masterChannel) => ({
      ...masterChannel,
      value: localValueByKey[masterChannel.key] ?? masterChannel.value ?? true,
    }))

    //update the user tags to OneSignal profile, when user is logged in only
    if (isNativeApp.value) {
      const currentUser = useCurrentUser()
      if (currentUser.value) {
        local.one_signal_notification_channels.forEach((channel) => {
          toggleOneSignalUserTag(channel.key, channel.value)
        })
      }
    }

    return local.one_signal_notification_channels
  }

  // function to log in and manage the user in OneSignal with supabase data
  async function OneSignalLogin () {
    if (!isNativeApp.value) return
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    const currentUser = useCurrentUser()
    const currentUserProfile = useCurrentUserProfile()

    if (!currentUser?.value) return

    const supabaseId: string = currentUser.value.id

    // log in to OneSignal with Salesforce ID
    await OneSignal.login(supabaseId)

    // add email to One Signal
    if (currentUser.value.email) { await OneSignal.User.addEmail(currentUser.value.email) }
    if (currentUser.value.phone) { await OneSignal.User.addSms(currentUserProfile.value.phone) }

    // check for salesforce_id and update OneSignal
    setSalesForceId()

    // check subscriptions and update Supabase profile
    setSubscriptions()

    // add/update name, to OneSignal tags
    if (currentUser.value.user_metadata.full_name) await OneSignal.User.addTags({ "name": currentUser.value.user_metadata.full_name })
  }

  // get current tags
  const getUserTags = async () => {
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return null
    const currentUser = useCurrentUser()
    if (currentUser.value) {
      const tags = await OneSignal.User.getTags()
      return tags
    } else {
      return null
    }
  }

  // function to log out the user in OneSignal
  async function logout () {
    if (!isNativeApp.value) return
    const OneSignal = await loadOneSignal()
    if (!OneSignal) return
    await OneSignal.logout()
  }

  return { initOneSignal, requestNotificationPermission, checkPermissions, notificationPermissionSync, OneSignalLogin, logout, toggleOneSignalUserTag, getUserTags, getMasterNotificationChannels, masterNotificationChannelsArray, syncMasterNotificationChannels, handleAppUrlOpen }
}