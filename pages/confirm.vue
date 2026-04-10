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
})

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const { setAuthState } = useAuth()

// Handle PKCE OAuth flow: exchange the ?code= query param for a session
// This is required for Google/Apple OAuth which returns a code after redirect
const code = route.query.code as string | undefined
if (code) {
  try {
    await supabase.auth.exchangeCodeForSession(code)
  } catch (error) {
    console.error("Failed to exchange OAuth code for session:", error)
  }
}

watch(
  user,
  async () => {
    if (user.value) {
      try {
        // Get the current Supabase session
        const { data: sessionData } = await supabase.auth.getSession()

        if (sessionData.session) {
          // Convert Supabase session to JWT
          const jwtResponse = await $fetch(`${config.public.BFF_URL}/api/auth/session-to-jwt`, {
            method: "POST",
            body: {
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
            },
          })

          if (jwtResponse.success && jwtResponse.token) {
            // Set the JWT token in our auth system with refresh token
            setAuthState(
              jwtResponse.token,
              jwtResponse.user,
              sessionData.session.refresh_token
            )
          }
        }
        await nextTick()
        await getAndSetUserProfile()
        navigateTo("/home")
      } catch (error) {
        console.error("JWT generation failed:", error)
        // Fall back to normal flow
        await nextTick()
        await getAndSetUserProfile()
        navigateTo("/home")
      }
    }
  },
  { immediate: true }
)
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
