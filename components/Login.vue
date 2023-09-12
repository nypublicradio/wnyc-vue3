<script async setup>
import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

import {
  useSignupSideBar,
  useLoginSideBar,
  useSettingSideBar,
  useForgotPasswordSideBar,
} from '~/composables/states'

const settingsSideBar = useSettingSideBar()
const signUpSideBar = useSignupSideBar()
const loginSideBar = useLoginSideBar()
const forgotPasswordSideBar = useForgotPasswordSideBar()

const client = useSupabaseClient()
const config = useRuntimeConfig()

const onSignupClick = () => {
  loginSideBar.value = false
  signUpSideBar.value = true
}

const closeAll = () => {
  loginSideBar.value = false
  signUpSideBar.value = false
  settingsSideBar.value = false
}

const openForgotPassword = () => {
  loginSideBar.value = false
  forgotPasswordSideBar.value = true
}
</script>

<template>
  <div>
    <section class="login">
      <div class="flex mb-4">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="
            () => {
              loginSideBar = false
            }
          "
        />
        <h1>Log in</h1>
      </div>
      <p>
        Don't have an account yet?
        <Button link label="Sign up" class="link" @click="onSignupClick" />
      </p>
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="google"
        label="Log in with Google"
        severity="secondary"
        class="center my-3"
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
        @submit-success="closeAll"
      >
        <template #belowSubmit>
          <div class="mt-4 relative">
            <p class="text-center">
              <Button
                link
                label="Forgot password?"
                class="link m-auto block"
                @click="openForgotPassword"
              />
            </p>
          </div>
        </template>
      </VLoginWithEmail>
    </section>
  </div>
</template>
