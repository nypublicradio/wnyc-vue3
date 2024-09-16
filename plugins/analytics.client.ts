//import { useMembershipStatus } from "~~/composables/states"
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

export default defineNuxtPlugin(() => {

  // event to use when sending gtag events
  const sendEvent = async (name, params) => {
    await FirebaseAnalytics.logEvent({
      name,
      params: params,
    });
  }
  // gtag event for reporting on page views
  const sendPageView = (params) => {
    const currentUser = useCurrentUser()
    const deviceId = useDeviceId()
    sendEvent('page_view', {
      page_location: document.location.href,
      page_title: document.title,
      user_id: currentUser.value?.id ?? deviceId.value,
      ...params
    })
  }
  return {
    provide: {
      analytics: {
        sendEvent,
        sendPageView
      }
    }
  }
})