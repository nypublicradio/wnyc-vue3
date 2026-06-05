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

const route = useRoute()
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const { setAuthState } = useAuth()

// Handle OAuth callback
// Implicit flow: tokens come in the URL hash fragment (#access_token=...&refresh_token=...)
// PKCE flow: code comes as a query param (?code=...)
const code = route.query.code as string | undefined
console.log("route.query", route.query)
if (code) {
  // PKCE flow
  try {
    await supabase.auth.exchangeCodeForSession(code)
  } catch (error) {
    console.error("Failed to exchange OAuth code for session:", error)
  }
} else if (route.hash) {
  // Implicit flow: parse tokens from hash fragment
  const hashParams = new URLSearchParams(route.hash.substring(1))
  const accessToken = hashParams.get("access_token")
  const refreshToken = hashParams.get("refresh_token")

  if (accessToken && refreshToken) {
    try {
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })
    } catch (error) {
      console.error("Failed to set session from hash tokens:", error)
    }
  }

  // Implicit flow: session is set, proceed directly
  await nextTick()
  await getAndSetUserProfile()
  navigateTo("/home")
}

// PKCE flow: wait for the user ref to update after exchangeCodeForSession
if (code) {
  watch(
    user,
    async () => {
      if (user.value) {
        console.log("user updated and ready")
        try {
          // Get the current Supabase session
          const { data: sessionData } = await supabase.auth.getSession()

          if (sessionData.session) {
            // Convert Supabase session to JWT
            const jwtResponse = await $fetch(
              `${config.public.BFF_URL}/api/auth/session-to-jwt`,
              {
                method: "POST",
                body: {
                  access_token: sessionData.session.access_token,
                  refresh_token: sessionData.session.refresh_token,
                },
              }
            )

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
    { immediate: false }
  )
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
