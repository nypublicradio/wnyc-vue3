<script setup lang="ts">
import { getAndSetUserProfile } from "~/utilities/helpers"
import { useAuth } from "~/composables/useAuth"
useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu background-gradient style-mode-dark",
  },
})

definePageMeta({
  layout: "default",
})

const user = useSupabaseUser()
// JWT token is set in the cookie by the auth middleware
// when the user is authenticated, so we can use it to allow access to the Salesforce endpoint
const supabase = useSupabaseClient()
const { setAuthState } = useAuth()
watch(
  user,
  async () => {
    if (user.value) {
      try {
        // Get the current Supabase session
        const { data: sessionData } = await supabase.auth.getSession()
        
        if (sessionData.session) {
          // Convert Supabase session to JWT
          const jwtResponse = await $fetch('/api/auth/session-to-jwt', {
            method: 'POST',
            body: {
              access_token: sessionData.session.access_token,
              refresh_token: sessionData.session.refresh_token,
            }
          })
          
          if (jwtResponse.success && jwtResponse.token) {
            // Set the JWT token in our auth system with refresh token
            setAuthState(jwtResponse.token, jwtResponse.user, sessionData.session.refresh_token)
          }
        }
        
        await nextTick()
        await getAndSetUserProfile()
        navigateTo("/home")
      } catch (error) {
        console.error('JWT generation failed:', error)
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
  <section class="loading-holder">
    <WnycLoader class="loader-anim" />
  </section>
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
</style>
