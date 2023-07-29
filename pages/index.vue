<script setup async>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { useCurrentUser } from '~/composables/states'
useHead({
  bodyAttrs: {
    class: 'hide-header hide-bottom-menu background-gradient style-mode-dark',
  },
})

const client = useSupabaseClient()

definePageMeta({
  layout: 'blank',
})

// definePageMeta({
//   middleware: 'check-auth-provider',
// })

const route = useRoute()

// const currentUser = useCurrentUser()
// const client = useSupabaseClient()

onMounted(async () => {
  //   const url = new URL(window.location.href)
  //   const params = new URLSearchParams(url.hash.substring(1)) // Remove the leading '#' symbol
  //   const access_token = params.get('access_token')
  //   const refresh_token = params.get('refresh_token')
  //   console.log('access_token = ', access_token)
  //   console.log('refresh_token = ', refresh_token)
  //   client.auth.setSession({
  //     access_token: access_token,
  //     refresh_token: refresh_token,
  //   })
  //   window.location.href = '/home'

  const config = useRuntimeConfig()
  const currentUser = useCurrentUser()
  const client = useSupabaseClient()

  const user = await client.auth.getSession()
  console.log('user = ', user)

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
    // for some reason, navigateTo doesn't work here?!
    window.location.href = '/home'
  }

  // sometimes the supabase token doesn't get detected right away when magic links are used
  // i don't think we should have to do this, but here we are
  setTimeout(() => {
    // check if the user is logged in
    if (user?.data?.session?.user) {
      currentUser.value = user?.data?.session?.user
    }
    // redirect to home if the user is logged in
    if (currentUser.value) {
      console.log('currentUser setTimeout found', currentUser.value)
      // for some reason, navigateTo doesn't work here?!
      window.location.href = '/home'
    }
  }, 1000)
})
</script>
<template>
  <div class="page" :class="[`${String(route.name)}`]">
    <section class="index-page flex flex-column">
      <WnycLogo class="w-12rem m-auto my-7" />
      <h1 class="headline">What's new?</h1>
      <ul class="list m-auto mt-4 mb-7">
        <li>Listen to WNYC's Live Radio Stream</li>
        <li>Get the latest news updates</li>
        <li>Stream your favorite podcasts</li>
        <li>Read local news from Gothamist</li>
        <li>Follow your favorite shows</li>
      </ul>
      <h1 class="headline mb-4">Get started!</h1>
      <div class="text-center flex flex-column gap-3">
        <VFlexibleLink raw to="/signup" class="w-13rem m-auto">
          <Button
            class="w-full"
            label="Create Free Account"
            rounded
            size="small"
          />
        </VFlexibleLink>
        <p>or</p>
        <VFlexibleLink raw to="/login" class="w-13rem m-auto">
          <Button
            class="w-full"
            label="Log in"
            rounded
            size="small"
            severity="secondary"
          />
        </VFlexibleLink>
        <p>
          <VFlexibleLink to="/home">Skip this</VFlexibleLink>, I'll create an
          account later.
        </p>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.index-page {
  .headline {
    font-size: 30px;
    text-align: center;
    letter-spacing: -0.6px;
    font-family: $fontFamilyTisa;
  }
  .list {
    li {
      font-size: 1rem;
      line-height: normal;
      margin-bottom: 0.5rem;
      letter-spacing: 0.32px;
    }
  }
}
</style>
