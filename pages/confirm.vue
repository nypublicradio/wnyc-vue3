<script setup lang="ts">
import { getAndSetUserProfile } from "~/utilities/helpers"
import { useAuth } from "~/composables/useAuth"
import { useAuthReturnRoute } from "~/composables/useAuthReturnRoute"

useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu hide-footer",
  },
})

definePageMeta({
  layout: "default",
  ssr: false,
})

const { handleOAuthCallback } = useAuth()
const { getAuthReturnRoute, clearAuthReturnRoute } = useAuthReturnRoute()

// On web, the OAuth provider redirects back here with tokens in the hash or code in query.
// handleOAuthCallback handles all cases including when the Supabase plugin has already
// consumed the URL params — it falls back to initializing from the existing session.
const callbackUrl = window.location.href

onMounted(async () => {
  const success = await handleOAuthCallback(callbackUrl)

  if (success) {
    await nextTick()
    try {
      await getAndSetUserProfile()
    } catch (error) {
      console.warn(
        "Profile setup (getAndSetUserProfile) incomplete on first login, will retry on home:",
        error
      )
    }
  } else {
    console.error(
      "Auth callback failed — no params in URL and no active Supabase session.",
      callbackUrl
    )
  }

  const returnRoute = await getAuthReturnRoute()
  console.log(
    "Auth callback complete, navigating to return route:",
    returnRoute
  )
  clearAuthReturnRoute()
  // If returnRoute is not set or is still "/confirm" (the default), navigate to "/home"
  const destination =
    returnRoute && returnRoute !== "/confirm" ? returnRoute : "/home"
  await navigateTo(destination, { replace: true })
})
</script>
<template>
  <div class="confirm-page">
    <section class="loading-holder">
      <WnycLoader class="loader-anim" />
    </section>
  </div>
</template>

<style lang="scss" scoped>
.confirm-page {
  height: 100vh;
  .loading-holder {
    display: flex;
    position: absolute;
    height: calc(40vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
    width: 100%;
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
}
</style>
