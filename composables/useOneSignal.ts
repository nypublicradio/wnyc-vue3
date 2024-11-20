import OneSignal from "onesignal-cordova-plugin"
import {
  useCurrentUserProfile,
  useCurrentUser,
} from "~/composables/states"
import { PushNotifications } from "@capacitor/push-notifications"

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

  const setSalesForceId = async () => {
    const tags = await OneSignal.User.getTags();
    console.log('tags = ', tags)
    if (tags.salesforce_id) return
    console.log('salesforce_id not found in tags')
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
      await OneSignal.User.addTags({ "salesforce_id": salesforceId });
    }
  }

  const setOneSignalId = async () => {
    const currentUser = useCurrentUser()
    oneSignalId = await OneSignal.User.getOnesignalId()
    console.log('oneSignalId = ', oneSignalId)
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
    console.log('oneSignalSubscriptionId = ', oneSignalSubscriptionId)

    console.log('profile.one_signal_subscription_ids = ', profile.one_signal_subscription_ids)

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
      // legacy code
      PushNotifications.register()
    } else {
      currentUserProfile.value.receive_general_notifications = false
    }
    console.log("notifications changed: ", accepted);
  }

  const pushSubscriptionListener = (event) => {
    console.log("Push subscription changed: ", event);
  };

  const userListener = async (event) => {
    console.log("user listener: ", event);
    setOneSignalId()
  };

  async function init() {
    const config = useRuntimeConfig()

    await OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)

    await OneSignal.Notifications.addEventListener("click", notificationClickListener)

    await OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)

    await OneSignal.Notifications.addEventListener("permissionChange", notificationPermissionListener);

    await OneSignal.User.pushSubscription.addEventListener("change", pushSubscriptionListener);

    await OneSignal.User.addEventListener("change", userListener);
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

    // add email to One Signal
    await OneSignal.User.addEmail(currentUser.value.email);

    // check for salesforce_id and update OneSignal
    setSalesForceId()

    // check subscriptions and update Supabase profile
    setSubscriptions()

    // add/update name, email, phone to OneSignal tags
    // NEED TO WAIT FOR FULL PAID ACCOUNT for more than 2 tags
    //await OneSignal.User.addTags({ "email": currentUser.value.email || null, "name": currentUser.value.user_metadata.full_name || null, "phone": currentUser.value.phone || null });
  }

  async function logout() {
    await OneSignal.logout();
  }

  return { init, requestNotificationPermission, login, logout }
}
