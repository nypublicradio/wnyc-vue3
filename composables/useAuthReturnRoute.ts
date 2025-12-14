import { Preferences } from "@capacitor/preferences"

export const useAuthReturnRoute = () => {

  const setAuthReturnRoute = async (route: string) => {
    await Preferences.set({
      key: "authReturnRoute",
      value: route
    })
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

    if (!isAuthCallback) {
      await Preferences.remove({
        key: "authReturnRoute"
      })
    }
  }

  const clearAuthReturnRoute = async () => {
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
