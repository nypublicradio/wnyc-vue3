<script setup lang="ts">
import { getAndSetUserProfile } from "~/utilities/helpers"

useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu background-gradient style-mode-dark",
  },
})

definePageMeta({
  layout: "default",
})

const user = useSupabaseUser()
// Function to initialize authentication and set JWT for the user
const initializeAuth = async () => {
  if (!user.value) return
  
  await nextTick()
  
  // Initialize JWT authentication
  const { setAuthState } = useAuth()
  const supabase = useSupabaseClient()
  const { data: sessionData } = await supabase.auth.getSession()
  
  if (sessionData?.session) {
    try {
      const jwtResponse = await $fetch("/api/auth/session-to-jwt", {
        method: "POST",
        body: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
        },
      })
      
      if (jwtResponse.success && jwtResponse.token) {
        await setAuthState(
          jwtResponse.token,
          jwtResponse.user,
          sessionData.session.refresh_token
        )
      }
    } catch (error) {
      console.error("Failed to generate JWT:", error)
    }
  }
  
  await getAndSetUserProfile()
  navigateTo("/home")
}

watch(user, initializeAuth, { immediate: true })
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
