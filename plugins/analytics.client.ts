import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { useCurrentUser } from '~/composables/states'
import { buildPageViewEventParams } from '~/utilities/analytics'

/**
 * Creates the shared analytics API used by the app and tests.
 */
export const createAnalyticsApi = ({
  getCurrentUserId,
  getDeviceId,
  getLocationHref,
  getDocumentTitle,
  logEvent,
}) => {
  /**
   * Forwards arbitrary analytics events to Firebase.
   */
  const sendEvent = async (eventName, eventParams) => {
    await logEvent({
      name: eventName,
      params: eventParams,
    })
  }

  /**
   * Sends a page view immediately using the best available user identifier.
   */
  const sendPageView = (params) =>
    sendEvent('page_view', buildPageViewEventParams({
      currentUserId: getCurrentUserId(),
      deviceId: getDeviceId(),
      locationHref: getLocationHref(),
      title: getDocumentTitle(),
      params,
    }))

  return {
    sendEvent,
    sendPageView,
  }
}

export default defineNuxtPlugin(() => {
  const currentUser = useCurrentUser()
  const deviceId = useDeviceId()
  const analytics = createAnalyticsApi({
    getCurrentUserId: () => currentUser.value?.id,
    getDeviceId: () => deviceId.value,
    getLocationHref: () => document.location.href,
    getDocumentTitle: () => document.title,
    logEvent: FirebaseAnalytics.logEvent,
  })

  return {
    provide: {
      analytics,
    }
  }
})
