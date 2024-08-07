//import { useMembershipStatus } from "~~/composables/states"
import { FirebaseAnalytics } from '@capacitor-firebase/analytics';

export default defineNuxtPlugin(async () => {

  // event to use when sending gtag events
  const sendEvent = async (name: string, params: Record<string, string>) => {
    await FirebaseAnalytics.logEvent({
      name: name,
      params: params,
    });
  }
  // gtag event for reporting on page views
  const sendPageView = async (params: Record<string, string>) => {
    const currentUser = useCurrentUser()
    sendEvent('page_view', {
      page_location: document.location.href,
      page_title: document.title,
      user_id: currentUser.value?.id,
      //NYPRMember: membershipStatus.value,
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