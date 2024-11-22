import OneSignal from "onesignal-cordova-plugin"
import {
  useCurrentUserProfile,
  useCurrentUser,
} from "~/composables/states"
import {
  trackClickEvent,
  getPathAndQuery,
  askTrackingPermissions,
} from "~/utilities/helpers"
import { Capacitor } from "@capacitor/core"
//import { PushNotifications } from "@capacitor/push-notifications"

export default function useOneSignal() {

  let oneSignalSubscriptionId: string = null
  let oneSignalId: string = null

  const linkOrRouteOrAction = (event) => {
    console.log('notification event', event)
    const url = event.result.url
    const action = event.result.actionId
    if (url) {
      if (!url.includes("https://")) {
        // deep link
        const route = getPathAndQuery(url)
        console.log("route = ", route)

        trackClickEvent(
          "Deep link",
          "Notification",
          `url = ${url}`
        )

        navigateTo(route)
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

      // if the url is a link to a web page, then open it in a new tab
      trackClickEvent(
        "Link",
        "Notification",
        `url = ${url}`
      )
      // the link opens by its self
      //window.open(url, "_blank")
    }

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

  const setSalesForceId = async () => {
    const tags = await OneSignal.User.getTags()
    //console.log('tags = ', tags)
    if (tags.salesforce_id) return
    //console.log('salesforce_id not found in tags')
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
    }
  }

  const setOneSignalId = async () => {
    const currentUser = useCurrentUser()
    oneSignalId = await OneSignal.User.getOnesignalId()
    //console.log('oneSignalId = ', oneSignalId)
    const client = useSupabaseClient()
    await client
      .from("profiles")
      .update({
        onesignal_id: oneSignalId,
      })
      .match({ id: currentUser.value.id })
  }

  const setSubscriptions = async () => {
    const currentUser = useCurrentUser()
    // update Supabase profile with oneSignalSubscriptionId (push to array)
    const client = useSupabaseClient()
    const { data: profile } = await client
      .from("profiles")
      .select("one_signal_subscription_ids")
      .eq("id", currentUser.value.id)
      .single()

    oneSignalSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
    //console.log('oneSignalSubscriptionId = ', oneSignalSubscriptionId)

    //console.log('profile.one_signal_subscription_ids = ', profile.one_signal_subscription_ids)

    let subscriptionIds: Array<string> = profile.one_signal_subscription_ids || []

    if (!subscriptionIds.includes(oneSignalSubscriptionId)) {
      subscriptionIds.push(oneSignalSubscriptionId)

      console.log('subscriptionIds = ', subscriptionIds)

      await client
        .from("profiles")
        .update({
          one_signal_subscription_ids: subscriptionIds,
        })
        .match({ id: currentUser.value.id })
    }
  }

  const notificationClickListener = async function (event) {
    //console.log("OneSignal notification clicked: ", event)
    //console.log("OneSignal additionalData: ", event.notification.additionalData)
    linkOrRouteOrAction(event)
  }

  const inAppNotificationClickListener = async function (event) {
    //console.log("OneSignal In-App Message Clicked: ", event)
    linkOrRouteOrAction(event)
  }

  const notificationPermissionListener = async (accepted) => {
    alert('permission change')
    const currentUserProfile = useCurrentUserProfile()

    if (accepted) {
      // Register with Apple / Google to receive push via APNS/FCM
      currentUserProfile.value.receive_general_notifications = true
      // legacy code
      //PushNotifications.register()
    } else {
      currentUserProfile.value.receive_general_notifications = false
    }
    //console.log("notifications changed: ", accepted);
  }

  const pushSubscriptionListener = (event) => {
    console.log("Push subscription changed: ", event);
  };

  const userListener = async (event) => {
    //console.log("user listener: ", event);
    setOneSignalId()
  };

  const checkPermissions = async () => {
    return await OneSignal.Notifications.getPermissionAsync();
  }

  async function init() {
    const config = useRuntimeConfig()

    await OneSignal.setConsentRequired(false)
    await OneSignal.setConsentGiven(true)
    await OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)
    await OneSignal.InAppMessages.setPaused(false)

    await OneSignal.Notifications.addEventListener("click", notificationClickListener)

    await OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)

    await OneSignal.Notifications.addEventListener("permissionChange", notificationPermissionListener)

    await OneSignal.User.pushSubscription.addEventListener("change", pushSubscriptionListener)

    await OneSignal.User.addEventListener("change", userListener)
  }

  async function requestNotificationPermission() {
    await OneSignal.Notifications.requestPermission()
  }

  async function login() {
    const currentUser = useCurrentUser()
    const currentUserProfile = useCurrentUserProfile()
    // console.log('currentUser.value = ', currentUser.value)
    // console.log('currentUserProfile.value = ', currentUserProfile.value)

    if (!currentUser?.value) return

    //const salesforceId: string = currentUser.value.salesforce_id
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
    //await OneSignal.User.addTags({ "name": currentUser.value.user_metadata.full_name || null });
  }

  async function logout() {
    await OneSignal.logout()
  }

  const doActionId = async (actionId) => {
    console.log('actionId = ', actionId)
    switch (actionId) {
      case "tracking-permission":
        await askTrackingPermissions()
        break
      case "action2":
        // do something
        break

    }
  }

  return { init, requestNotificationPermission, checkPermissions, login, logout }
}
