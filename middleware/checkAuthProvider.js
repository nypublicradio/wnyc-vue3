
import {
  useCurrentUser
} from '~/composables/states'
import { Preferences } from '@capacitor/preferences'

export default defineNuxtRouteMiddleware(async () => {
  const client = useSupabaseClient()
  const config = useRuntimeConfig()
  const currentUser = useCurrentUser()
  const redirectSlug = '/home'
  const user = await client.auth.getSession()

  // update the user's profile (name and image) if they signed up with google
  const updateUser = async () => {
    if (user.data.session.user.app_metadata.provider === 'google') {
      await client
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          name: user.data.session.user.user_metadata.full_name,
          avatar_image_url: user.data.session.user.user_metadata.avatar_url,
        })
        .match({ id: user.data.session.user.id })
    }
  }

  if (process.client) {
    // check local storage for the auth token
    const supabaseAuthToken = await Preferences.get({ key: config.public.supabaseAuthTokenName })

    if (supabaseAuthToken.value) {
      currentUser.value = supabaseAuthToken.user
    }

    // check supabase session for logged in user
    if (user?.data?.session?.user) {
      currentUser.value = user?.data?.session?.user
    }

    // redirect to home if the user is logged in
    if (currentUser.value) {
      await updateUser()
      navigateTo(redirectSlug)
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
        await updateUser()
        navigateTo(redirectSlug)
      }


    }, 1000)
  }

})

