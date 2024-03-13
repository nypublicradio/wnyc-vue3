<script setup>
import VSignupWithEmail from "@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VSignupWithEmail.vue"
//import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from "@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue"
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"

import {
  useSignupSideBar,
  useLoginSideBar,
  useSettingSideBar,
} from "~/composables/states"

import { trackClickEvent } from "~/utilities/helpers"

const settingsSideBar = useSettingSideBar()
const signUpSideBar = useSignupSideBar()
const loginSideBar = useLoginSideBar()

const client = useSupabaseClient()
const config = useRuntimeConfig()

// handle the login and signup sidebars when the user clicks on the login link
const onLoginClick = () => {
  loginSideBar.value = true
  signUpSideBar.value = false
  trackClickEvent(
    "Click Tracking - log in",
    "Sign Up Sidebar - user section",
    "log in link"
  )
}

// actions to be taken with the signup link is clicked
const onSignup = (provider) => {
  trackClickEvent("Click Tracking - sign up", "Sign Up Sidebar - user section", provider)
}

// close all sidebars
const closeAll = () => {
  onSignup("email")
  loginSideBar.value = false
  signUpSideBar.value = false
  settingsSideBar.value = false
}
</script>

<template>
  <div class="signup">
    <section>
      <SHeader label="Sign up" @close-sidebar="signUpSideBar = false" />
    </section>
    <section>
      <p>
        Already have an account?
        <Button link label="Log in" class="link" @click="onLoginClick" />
      </p>
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="google"
        label="Sign up with Google"
        severity="secondary"
        class="center my-3"
        @login-success="onSignup('google')"
      />
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="apple"
        severity="secondary"
        class="center"
        label="Sign up with Apple"
        @login-success="onSignup('apple')"
      />
      <Divider class="my-4" align="center">
        <b>or</b>
      </Divider>
      <VSignupWithEmail
        :client="client"
        :config="config"
        label="Sign up"
        slug="/confirm"
        @login-success="closeAll"
      >
        <template #aboveSubmit>
          <p class="mb-3">
            By proceeding to create your account, you are agreeing to New York Public
            Radio's
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
