
import {
  useCurrentUser
} from '~/composables/states'
import { Capacitor } from '@capacitor/core'
import { Preferences } from '@capacitor/preferences'

export default defineNuxtRouteMiddleware(async () => {

  const client = useSupabaseClient()
  const config = useRuntimeConfig()
  const currentUser = useCurrentUser()
  const redirectSlug = '/home'
  const user = await client.auth.getSession()

  const isApp = shallowRef(Capacitor.getPlatform() !== 'web')
  console.log('isApp', isApp.value)

  // update the user's profile (name and image) if they signed up with google
  const updateUser = async () => {
    if (currentUser.value.user_metadata.provider === 'google') {
      await client
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          name: currentUser.value.user_metadata.full_name,
          avatar_image_url: currentUser.value.user_metadata.avatar_url,
        })
        .match({ id: currentUser.value.id })
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
      //window.location.href = redirectSlug
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
        // for some reason, navigateTo doesn't work here?!
        await updateUser()
        //window.location.href = redirectSlug
        navigateTo(redirectSlug)
      }


    }, 1000)
  }

})

