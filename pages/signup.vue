<script setup>
import VSignupWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VSignupWithEmail.vue'
//import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
const router = useRouter()
const client = useSupabaseClient()
const config = useRuntimeConfig()

definePageMeta({
  layout: 'blank',
  pageTransition: {
    name: 'login',
  },
})

useHead({
  bodyAttrs: {
    class: 'background2',
  },
})
</script>

<template>
  <div>
    <section class="signup">
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
        <h1>Sign up</h1>
      </div>
      <p>
        Already have an account?
        <VFlexibleLink to="/login">Log in</VFlexibleLink>
      </p>
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="google"
        label="Sign up with Google"
        severity="secondary"
        class="center my-3"
      />
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="apple"
        severity="secondary"
        class="center"
        label="Sign up with Apple"
      />
      <Divider class="my-4" align="center">
        <b>or</b>
      </Divider>
      <VSignupWithEmail
        :client="client"
        :config="config"
        label="Sign up"
        slug="/home"
      >
        <template #aboveSubmit>
          <p class="mb-3">
            By proceeding to create your account, you are agreeing to New York
            Public Radio's
            <VFlexibleLink to="/terms">Terms of Service</VFlexibleLink> and
            <VFlexibleLink to="/privacy">Privacy Policy</VFlexibleLink>
          </p>
        </template>
        <!-- <template #success>
          <VLoginWithEmail
            :client="client"
            :config="config"
          />
        </template> -->
      </VSignupWithEmail>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.signup {
}
</style>
