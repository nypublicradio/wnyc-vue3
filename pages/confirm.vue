<script setup lang="ts">
import { getAndSetUserProfile } from "~/utilities/helpers"
import { useAuth } from "~/composables/useAuth"

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

// On web, the OAuth provider redirects back here with tokens in the hash or code in query.
// handleOAuthCallback parses the URL, establishes the Supabase session, and generates the JWT.
const callbackUrl = window.location.href

const success = await handleOAuthCallback(callbackUrl)
if (success) {
  await nextTick()
  await getAndSetUserProfile()
  navigateTo("/home")
} else {
  // If no auth params were found (e.g. user navigated here directly), just go home
  console.error(
    "No auth params found in URL, redirecting to home, handleOAuthCallback(callbackUrl) failed",
    callbackUrl
  )
  navigateTo("/home")
}
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
