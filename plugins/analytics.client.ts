import { FirebaseAnalytics } from '@capacitor-firebase/analytics';
import { useCurrentUser } from '~/composables/states'
import { buildPageViewEventParams } from '~/utilities/analytics'

export const createAnalyticsApi = ({
  getCurrentUserId,
  getDeviceId,
  getLocationHref,
  getDocumentTitle,
  logEvent,
}) => {
  const sendEvent = async (eventName, eventParams) => {
    await logEvent({
      name: eventName,
      params: eventParams,
    })
  }

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
