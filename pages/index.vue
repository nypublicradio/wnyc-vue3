<script setup async>
import { setStatusDarkMode } from "~/utilities/helpers"
import { useCurrentUserProfile, useCurrentUser } from "~/composables/states.ts"
import { useBrowserTopColorDarkMode, localUserProfileKey } from "~/composables/globals.ts"
import { Preferences } from '@capacitor/preferences'
import { FirebaseAnalytics } from '@capacitor-firebase/analytics'


useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu",
  },
})

definePageMeta({
  layout: "default",
  //middleware: ["check-auth-provider"],
})

const client = useSupabaseClient()
const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const redirectSlug = '/home'
const redirectDelay = 500
const currentUserProfile = useCurrentUserProfile()
const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const route = useRoute()
const user = await client.auth.getSession()

// update the user's profile (name and image) if they signed up with google
const updateUser = async () => {
  if (user.data.session?.user.app_metadata.provider === 'google') {
    await client
      .from('profiles')
      .update({
        updated_at: new Date().toISOString(),
        name: user.data.session.user.user_metadata.full_name,
        avatar_image_url: user.data.session.user.user_metadata.avatar_url,
      })
      .match({ id: user.data.session.user.id })
  }
  if (currentUser.value) {
    await FirebaseAnalytics.setUserId({
      userId: currentUser.value.id,
    })
  }
}

const delayNavigateTo = async () => {
  // delay the navigation to the home page
  setTimeout(() => {
    navigateTo(redirectSlug)
  }, redirectDelay)
}

const checkSession = async () => {
  if (user.data.session) {
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
      delayNavigateTo(redirectSlug)
      return
    }

    // sometimes the supabase token doesn't get detected right away when magic links are used
    // i don't think we should have to do this, but here we are
    // this is for the FORGOT PASSWORD flow
    setTimeout(async () => {
      // check if the user is logged in
      if (user?.data?.session?.user) {
        currentUser.value = user?.data?.session?.user
      }
      // redirect to home if the user is logged in
      if (currentUser.value) {

        await updateUser()
        delayNavigateTo(redirectSlug)
      }
    }, 1000)

  } else {
    // if the app has been launched before (set the local user profile), redirect to the home page
    const userLocalStorage = await Preferences.get({ key: localUserProfileKey })
    if (userLocalStorage.value) {
      await updateUser()
      delayNavigateTo(redirectSlug)
    } else {
      // this will always make sure to move to the home page
      delayNavigateTo(redirectSlug)
    }
  }
}

checkSession()

</script>
<template>
  <div>
    <Html>

    <Head>
      <Title>WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News</Title>
      <Meta name="og:title" content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News" />
      <Meta name="twitter:title" content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News" />
      <!-- force browser top color dark -->
      <Meta name="theme-color" :content="browserTopColorDarkMode" />
      <Meta name="msapplication-TileColor" :content="browserTopColorDarkMode" />
    </Head>

    </Html>
    <div class="page" :class="[`${String(route.name)} ${currentUserProfile?.dark_mode ? 'style-mode-dark' : ''}`]">
      <Transition name="fade">
        <section class="loading-holder">
          <WnycLoader class="loader-anim" :color="`${currentUserProfile?.dark_mode ? '#ffffff'
            : '#de1e3d'}`" />
        </section>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-holder {
  display: flex;
  position: absolute;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  width: 100vw;
  left: 0;
  right: 0;

  .loader-anim {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 100px;
    height: 50px;
  }
}

.index-page {
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
}
</style>
