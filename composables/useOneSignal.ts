import OneSignal from "onesignal-cordova-plugin"
import {
  useCurrentUserProfile,
  useCurrentUser,
} from "~/composables/states"

export default function useOneSignal() {

  let oneSignalSubscriptionId = null
  let oneSignalId = null

  const notificationClickListener = async function (event) {
    console.log("OneSignal notification clicked: ", event)
    console.log("OneSignal route: ", event.additionalData.route)
    if (event.additionalData.route) {
      navigateTo(event.additionalData.route)
    }
  }

  const inAppNotificationClickListener = async function (event) {
    console.log("OneSignal In-App Message Clicked: " + event)

    if (!event.url.startsWith("http")) {
      // deep link
      const url = event.url.replace(/^.*?\/\/.*?\//, "/")
      //alert("url = " + url)
      navigateTo(url)
      return
    }

    // if the url is a link to a web page, then open it in a new tab
    window.open(event.url, "_blank")

  }

  const notificationPermissionListener = async (accepted) => {
    const currentUserProfile = useCurrentUserProfile()

    if (accepted) {
      // Register with Apple / Google to receive push via APNS/FCM
      currentUserProfile.value.receive_general_notifications = true
    } else {
      currentUserProfile.value.receive_general_notifications = false
    }
    console.log("notifications changed: " + accepted);
  }

  const pushSubscriptionListener = (event) => {
    console.log("Push subscription changed: " + (event));
  };

  async function init() {
    const config = useRuntimeConfig()

    await OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)

    oneSignalSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
    oneSignalId = await OneSignal.User.getOnesignalId()

    OneSignal.Notifications.addEventListener("click", notificationClickListener)

    OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)

    OneSignal.Notifications.addEventListener("permissionChange", notificationPermissionListener);

    OneSignal.User.pushSubscription.addEventListener("change", pushSubscriptionListener);

  }

  function requestNotificationPermission() {
    OneSignal.Notifications.requestPermission()
  }

  async function login() {
    const currentUser = useCurrentUser()

    console.log('OneSignal.User.getOnesignalId() = ', await OneSignal.User.getOnesignalId())
    console.log('OneSignal.User.getExternalId() = ', await OneSignal.User.getExternalId())
    console.log('currentUser.value = ', currentUser.value)


    if (!currentUser?.value) return

    const salesforceId = currentUser.value.salesforce_id
    const supabaseId = currentUser.value.id
    // log in to OneSignal with Salesforce ID
    await OneSignal.login(salesforceId);

    // add email to One Signal
    await OneSignal.User.addEmail(currentUser.value.salesforce_id);

    // add Salesforce id to One Signal
    OneSignal.User.addTags({ "salesforce_id": salesforceId, "supabase_id": supabaseId });


    // update Supabase profile with oneSignalId & oneSignalSubscriptionId (push to array)
    const client = useSupabaseClient()
    const { data: profile } = await client
      .from("profiles")
      .select("one_signal_subscription_ids")
      .eq("id", currentUser.value.id)
      .single()

    console.log('profile.one_signal_subscription_ids = ', profile.one_signal_subscription_ids)

    let subscriptionIds = profile.one_signal_subscription_ids || []

    if (!subscriptionIds.includes(oneSignalSubscriptionId)) {
      subscriptionIds.push(oneSignalSubscriptionId)
    }

    await client
      .from("profiles")
      .update({
        onesignal_id: oneSignalId,
        one_signal_subscription_ids: subscriptionIds
      })
      .match({ id: currentUser.value.id })

  }

  async function logout() {
    await OneSignal.logout();
  }

  return { init, requestNotificationPermission, login, logout }
}
