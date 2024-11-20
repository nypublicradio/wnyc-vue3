import OneSignal from "onesignal-cordova-plugin"
import {
  useCurrentUserProfile,
  useCurrentUser,
} from "~/composables/states"

export default function useOneSignal() {

  let oneSignalSubscriptionId: string = null
  let oneSignalId: string = null

  const linkOrRouteOrAction = (event) => {
    const url = event.result.url
    const action = event.result.actionId
    if (url) {
      if (!url.startsWith("http")) {
        // deep link
        const route = url.replace(/^.*?\/\/.*?\//, "/")
        //alert("url = " + url)
        navigateTo(route)
        return
      }

      // if the url is a link to a web page, then open it in a new tab
      window.open(url, "_blank")
    }

    if (action) {
      // I would imagine that we would set and share action IDs to the team and react accordingly here
      //doActionId(actionId)
    }
  }

  const notificationClickListener = async function (event) {
    console.log("OneSignal notification clicked: ", event)
    console.log("OneSignal additionalData: ", event.notification.additionalData)
    linkOrRouteOrAction(event)
  }

  const inAppNotificationClickListener = async function (event) {
    console.log("OneSignal In-App Message Clicked: ", event)
    linkOrRouteOrAction(event)
  }

  const notificationPermissionListener = async (accepted) => {
    const currentUserProfile = useCurrentUserProfile()

    if (accepted) {
      // Register with Apple / Google to receive push via APNS/FCM
      currentUserProfile.value.receive_general_notifications = true
    } else {
      currentUserProfile.value.receive_general_notifications = false
    }
    console.log("notifications changed: ", accepted);
  }

  const pushSubscriptionListener = (event) => {
    console.log("Push subscription changed: ", (event));
  };

  async function init() {
    const config = useRuntimeConfig()

    await OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)



    await OneSignal.Notifications.addEventListener("click", notificationClickListener)

    await OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)

    await OneSignal.Notifications.addEventListener("permissionChange", notificationPermissionListener);

    await OneSignal.User.pushSubscription.addEventListener("change", pushSubscriptionListener);

  }

  async function requestNotificationPermission() {
    await OneSignal.Notifications.requestPermission()
  }

  async function login() {
    console.log('login()')
    const currentUser = useCurrentUser()
    console.log('currentUser.value = ', currentUser.value)

    if (!currentUser?.value) return

    //const salesforceId: string = currentUser.value.salesforce_id
    const supabaseId: string = currentUser.value.id
    // log in to OneSignal with Salesforce ID
    await OneSignal.login(supabaseId);

    oneSignalId = await OneSignal.User.getOnesignalId()
    console.log('oneSignalId = ', oneSignalId)
    oneSignalSubscriptionId = await OneSignal.User.pushSubscription.getIdAsync();
    console.log('oneSignalSubscriptionId = ', oneSignalSubscriptionId)

    console.log('OneSignal.User.getExternalId() = ', await OneSignal.User.getExternalId())

    // add email to One Signal
    await OneSignal.User.addEmail(currentUser.value.email);

    // add Salesforce id to One Signal
    await OneSignal.User.addTags({ /* "salesforce_id": salesforceId, */ "supabase_id": supabaseId });


    // update Supabase profile with oneSignalId & oneSignalSubscriptionId (push to array)
    const client = useSupabaseClient()
    const { data: profile } = await client
      .from("profiles")
      .select("one_signal_subscription_ids")
      .eq("id", currentUser.value.id)
      .single()

    console.log('profile.one_signal_subscription_ids = ', profile.one_signal_subscription_ids)

    let subscriptionIds: Array<string> = profile.one_signal_subscription_ids || []

    if (!subscriptionIds.includes(oneSignalSubscriptionId)) {
      subscriptionIds.push(oneSignalSubscriptionId)
    }

    console.log('subscriptionIds = ', subscriptionIds)

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
