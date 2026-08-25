import { FirebaseAnalytics } from '@capacitor-firebase/analytics'
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
    // The native Firebase Analytics plugin cannot handle null/undefined param values —
    // they cause a ClassCastException on Android. Strip them out before sending.
    const sanitizedParams = eventParams
      ? Object.fromEntries(Object.entries(eventParams).filter(([, v]) => v != null))
      : undefined
    try {
      await logEvent({
        name: eventName,
        params: sanitizedParams,
      })
    } catch (error) {
      // Analytics should never break product flows (login/navigation/etc).
      console.warn('[analytics] sendEvent failed:', error)
    }
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
    // Keep method invocation bound to the plugin object on native platforms.
    logEvent: (payload) => FirebaseAnalytics.logEvent(payload),
  })

  return {
    provide: {
      analytics,
    }
  }
})
