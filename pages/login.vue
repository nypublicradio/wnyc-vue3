<script async setup>
import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

definePageMeta({
  layout: 'blank',
  pageTransition: {
    name: 'login',
  },
})

const router = useRouter()
const client = useSupabaseClient()
const config = useRuntimeConfig()
useHead({
  bodyAttrs: {
    class: 'background2',
  },
})
</script>

<template>
  <div>
    <section class="login">
      <div class="flex mb-4">
        <Button
          class="back-btn empty -ml-3"
          icon="pi pi-chevron-left"
          rounded
          severity="secondary"
          aria-label="back to previous page"
          @click="
            () => {
              router.go(-1)
            }
          "
        />
        <h1>Log in</h1>
      </div>
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="google"
        label="Log in with Google"
        severity="secondary"
        class="center mb-3"
      />

      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="apple"
        label="Log in with Apple"
        severity="secondary"
        class="center"
      />
      <Divider class="my-4" align="center">
        <b>or</b>
      </Divider>
      <VLoginWithEmail
        label="Log in"
        :client="client"
        :config="config"
        slug="/home"
      >
        <template #belowSubmit>
          <div class="mt-4">
            <p class="text-center">
              <VFlexibleLink to="/forgot-password"
                >Forgot password?</VFlexibleLink
              >
            </p>
          </div>
          <div class="mt-6">
            <p class="my-2 text-center">Don't have an account yet?</p>
            <Button
              class="w-full"
              label="Sign up"
              severity="secondary"
              rounded
              @click="
                () => {
                  navigateTo('/signup')
                }
              "
            />
          </div>
        </template>
      </VLoginWithEmail>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.login {
}
</style>
