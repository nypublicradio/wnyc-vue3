import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { useCurrentUser } from '~/composables/states'

export default defineNuxtPlugin(() => {
  // event to use when sending gtag events
  const sendEvent = async (eventName, eventParams) => {
    await FirebaseAnalytics.logEvent({
      name: eventName,
      params: eventParams,
    });
  }
  // gtag event for reporting on page views
  const sendPageView = (params) => {
    const currentUser = useCurrentUser()
    const deviceId = useDeviceId()

    if (!currentUser.value) {
      watch(currentUser, (newValue) => {
        if (newValue) {
          sendEvent('page_view', {
            page_location: document.location.href,
            page_title: document.title,
            user_id: newValue.id ?? deviceId.value,
            ...params
          })
        }
      })
    } else {
      sendEvent('page_view', {
        page_location: document.location.href,
        page_title: document.title,
        user_id: currentUser.value?.id ?? deviceId.value,
        ...params
      })
    }
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