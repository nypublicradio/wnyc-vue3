import OneSignal from "onesignal-cordova-plugin"
import {
  useCurrentUserProfile,
  useCurrentUser,
  useSettingSideBar,
} from "~/composables/states"
import {
  trackClickEvent,
  getPathAndQuery,
  askTrackingPermissions,
} from "~/utilities/helpers"
import { ref } from "vue"
import { getOneSignalNotificationChannels } from '~/server/utils/oneSignalNotificationChannels'

// shared state for in-app notification
export const inAppNotificationActive = ref(false)

// notification channels array from the BFF server
export const notificationChannelsArray = getOneSignalNotificationChannels()

// base OneSignal composable
export default function useOneSignal() {

  let oneSignalSubscriptionId: string = null
  let oneSignalId: string = null

  // function to handle the list of action IDs from the notification click actions
  const doActionId = async (actionId) => {
    switch (actionId) {
      case "tracking-permission":
        await askTrackingPermissions()
        break
      case "donate":
        alert("you will see this when you return from the donate page. We can say thank you for donating or something")
        // do something
        break
      default:
        // do something
        break
    }
  }

  // function to handle the click actions of the notifications
  const linkOrRouteOrAction = (event) => {
    const url = event.result.url
    const action = event.result.actionId
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
        setTimeout(() => {
          navigateTo(route)
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

  // function to set the salesforce_id in OneSignal as a user tag
  const setSalesForceId = async () => {
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
    const currentUser = useCurrentUser()
    // update Supabase profile with oneSignalSubscriptionId (push to array)
    const client = useSupabaseClient()
    const { data: profile } = await client
      .from("profiles")
      .select("one_signal_subscription_ids")
      .eq("id", currentUser.value.id)
      .single()

    oneSignalSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();

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
  const notificationClickListener = async function (event) {
    linkOrRouteOrAction(event)
  }

  const inAppNotificationDidDisplay = function () {
    inAppNotificationActive.value = true

  }
  const inAppNotificationDidDismiss = function () {
    inAppNotificationActive.value = false
  }

  // triggered when the listener for InAppMessages "click" is called
  const inAppNotificationClickListener = function (event) {
    linkOrRouteOrAction(event)
  }

  // triggered when the listener for permissionChange is called
  const notificationPermissionListener = (accepted) => {
    const currentUserProfile = useCurrentUserProfile()

    if (accepted) {
      // Register with Apple / Google to receive push via APNS/FCM
      currentUserProfile.value.receive_general_notifications = true
    } else {
      currentUserProfile.value.receive_general_notifications = false
    }
  }

  // const pushSubscriptionListener = (event) => {
  //   console.log("Push subscription changed: ", event);
  // };

  // triggered when the listener for User "change" is called
  const userListener = () => {
    setOneSignalId()
  };

  // function to check the permissions for notifications
  const checkPermissions = async () => {
    return await OneSignal.Notifications.getPermissionAsync();
  }

  // function to initialize OneSignal
  async function initOneSignal() {
    const config = useRuntimeConfig()

    await OneSignal.setConsentRequired(false)
    await OneSignal.setConsentGiven(true)
    await OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)
    await OneSignal.InAppMessages.setPaused(false)

    //await OneSignal.Notifications.addEventListener("foregroundWillDisplay", notificationAboutToDisplay);

    await OneSignal.Notifications.addEventListener("click", notificationClickListener)

    await OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)

    //await OneSignal.InAppMessages.addEventListener("willDisplay", inAppNotificationDidDisplay);
    await OneSignal.InAppMessages.addEventListener("didDisplay", inAppNotificationDidDisplay);
    //await OneSignal.InAppMessages.addEventListener("willDismiss", inAppNotificationDidDismiss);
    await OneSignal.InAppMessages.addEventListener("didDismiss", inAppNotificationDidDismiss);

    await OneSignal.Notifications.addEventListener("permissionChange", notificationPermissionListener)

    //await OneSignal.User.pushSubscription.addEventListener("change", pushSubscriptionListener)

    await OneSignal.User.addEventListener("change", userListener)
  }

  // function to trigger the OS permission request
  async function requestNotificationPermission() {
    await OneSignal.Notifications.requestPermission()
  }

  // function to log in and manage the user in OneSignal with supabase data
  async function login() {
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
    if (currentUser.value.user_metadata.full_name) await OneSignal.User.addTags({ "name": currentUser.value.user_metadata.full_name });
  }

  // toggle users notifications channel tags
  const toggleOneSignalUserTag = async (channelKey: string, value: boolean) => {
    await OneSignal.User.addTag(channelKey, String(value))
  }

  // get current tags
  const getUserTags = async () => {
    const tags = await OneSignal.User.getTags()
    return tags
  }

  // function to log out the user in OneSignal
  async function logout() {
    await OneSignal.logout()
  }

  return { initOneSignal, requestNotificationPermission, checkPermissions, login, logout, toggleOneSignalUserTag, notificationChannelsArray, getUserTags }
}
