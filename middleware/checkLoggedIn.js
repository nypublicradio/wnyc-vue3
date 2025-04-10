import {
  useCurrentUser,
  useGlobalToast,
} from '~/composables/states'

export default defineNuxtRouteMiddleware(async () => {
  const currentUser = useCurrentUser()
  const router = useRouter()
  
  // navigate to the home page and notify the user 
  const routeAndNotify = (name = '') => {
    setTimeout(() => {
      const globalToast = useGlobalToast()
      globalToast.value = {
        severity: "info",
        summary: `Welcome back ${name}`,
        life: 4000,
        closable: true,
      }
    }, 500)
    router.replace('/home')
  }
  // check if the user is logged in 
  const checkSession = async () => {
    if (currentUser.value) {
      routeAndNotify(currentUser.value.user_metadata.name)
    }else{
      const client = useSupabaseClient()
      const user = await client.auth.getSession()
      if (user.data.session) {
        routeAndNotify(user.data.session.user.user_metadata.name)
      }
    }
  }
  checkSession()
})
