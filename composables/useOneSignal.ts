import OneSignal from "onesignal-cordova-plugin"
import {
  useCurrentUserProfile,
} from "~/composables/states"
const config = useRuntimeConfig()
export default function useOneSignal() {

  const currentUserProfile = useCurrentUserProfile()

  const notificationClickListener = async function (event) {
    console.log("OneSignal notification clicked: ", event)
    console.log("OneSignal route: ", event.additionalData.route)
  }

  const inAppNotificationClickListener = async function (event) {
    console.log("OneSignal In-App Message Clicked: " + event)
  }

  function init() {
    OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)

    OneSignal.Notifications.addEventListener("click", notificationClickListener)

    OneSignal.InAppMessages.addEventListener("click", inAppNotificationClickListener)


    OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {

      if (accepted) {
        // Register with Apple / Google to receive push via APNS/FCM
        currentUserProfile.value.receive_general_notifications = true
      } else {
        currentUserProfile.value.receive_general_notifications = false
      }
      console.log("User accepted notifications: " + accepted);
    });
  }

  const requestPermission = async () => {
    OneSignal.Notifications.requestPermission()
  }
  return { init, requestPermission }
}
