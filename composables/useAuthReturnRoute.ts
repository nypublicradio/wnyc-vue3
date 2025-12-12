
import { Preferences } from "@capacitor/preferences"

let returnRouteTimer: any = null

export const useAuthReturnRoute = () => {

  const setAuthReturnRoute = async (route: string) => {
    // clear the timer if it exists
    if (returnRouteTimer) {
      clearTimeout(returnRouteTimer)
    }

    await Preferences.set({
      key: "authReturnRoute",
      value: route
    })

    // set a timer to clear the route after 2 minutes
    returnRouteTimer = setTimeout(() => {
      clearAuthReturnRoute()
    }, 120000)
  }

  const getAuthReturnRoute = async () => {
    const { value } = await Preferences.get({
      key: "authReturnRoute"
    })
    return value
  }


  const checkStaleAuthRoute = async () => {
    // only clear if we aren't in the middle of an auth flow
    // check if the current route has auth params (code, access_token, etc)
    const route = useRoute()
    const isAuthCallback = route.query.code || route.hash.includes('access_token') || route.hash.includes('refresh_token')

    if (returnRouteTimer) {
      clearTimeout(returnRouteTimer)
      returnRouteTimer = null
    }

    if (!isAuthCallback) {
      await Preferences.remove({
        key: "authReturnRoute"
      })
    }
  }

  const clearAuthReturnRoute = async () => {
    if (returnRouteTimer) {
      clearTimeout(returnRouteTimer)
      returnRouteTimer = null
    }
    await Preferences.remove({
      key: "authReturnRoute"
    })
  }

  return {
    setAuthReturnRoute,
    getAuthReturnRoute,
    clearAuthReturnRoute,
    checkStaleAuthRoute
  }
}
