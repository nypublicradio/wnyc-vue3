
import {
  useCurrentUser
} from '~/composables/states'

export default defineNuxtRouteMiddleware(async () => {

  const client = useSupabaseClient()
  const config = useRuntimeConfig()
  const currentUser = useCurrentUser()
  const redirectSlug = '/home'
  const user = await client.auth.getSession()

  const updateUser = async (currentUser) => {
    if (currentUser.user_metadata.provider === 'google') {
      await client
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          name: currentUser.user_metadata.full_name,
          avatar_image_url: currentUser.user_metadata.avatar_url,
        })
        .match({ id: currentUser.id })
    }
  }

  if (process.client) {
    // check local storage for the auth token
    const supabaseAuthToken = JSON.parse(
      window.localStorage.getItem(config.supabaseAuthTokenName)
    )
    if (supabaseAuthToken) {
      currentUser.value = supabaseAuthToken.user
    }

    // check supabase session for logged in user
    if (user?.data?.session?.user) {
      currentUser.value = user?.data?.session?.user
    }

    // redirect to home if the user is logged in
    if (currentUser.value) {
      await updateUser(currentUser.value)
      window.location.href = redirectSlug
    }

    // sometimes the supabase token doesn't get detected right away when magic links are used
    // i don't think we should have to do this, but here we are
    setTimeout(async () => {
      // check if the user is logged in
      if (user?.data?.session?.user) {
        currentUser.value = user?.data?.session?.user
      }
      // redirect to home if the user is logged in
      if (currentUser.value) {

        //('currentUser setTimeout found', currentUser.value)
        // for some reason, navigateTo doesn't work here?!
        await updateUser(currentUser.value)
        window.location.href = redirectSlug
      }


    }, 1000)
  }

})

