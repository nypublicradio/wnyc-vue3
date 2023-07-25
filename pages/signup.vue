<script setup>
import VSignupWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VSignupWithEmail.vue'
//import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'

const router = useRouter()

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
      <VLoginWithProvider
        :client="useSupabaseClient()"
        :config="useRuntimeConfig()"
        provider="google"
        label="Sign up with Google"
      />
      <Divider class="my-4" align="center">
        <b>Or</b>
      </Divider>
      <VLoginWithProvider
        :client="useSupabaseClient()"
        :config="useRuntimeConfig()"
        provider="apple"
        label="Sign up with Apple"
      />
      <Divider class="my-4" align="center">
        <b>Or</b>
      </Divider>
      <VSignupWithEmail
        :client="useSupabaseClient()"
        :config="useRuntimeConfig()"
        slug="/"
      >
        <!-- <template #success>
          <VLoginWithEmail
            :client="useSupabaseClient()"
            :config="useRuntimeConfig()"
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
