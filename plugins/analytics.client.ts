import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

export default defineNuxtPlugin(() => {
  // event to use when sending gtag events
  const sendEvent = async (eventName, eventParams) => {
    await FirebaseAnalytics.logEvent({
      name: eventName,
      params: eventParams,
    });
  }
  // gtag event for reporting on page views
  const sendPageView = async (params) => {
    const currentUser = await useCurrentUser()
    const deviceId = useDeviceId()
    sendEvent('page_view', {
      page_location: document.location.href,
      page_title: document.title,
      user_id: currentUser.value?.id ?? deviceId.value,
      ...params
    })
    console.log('currentUser', currentUser.value)
    console.log('Page view sent',{
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