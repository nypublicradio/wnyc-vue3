<script async setup>
import VLoginWithEmail from "~/components/supabase/VLoginWithEmail.vue"
import VLoginWithProvider from "~/components/supabase/VLoginWithProvider.vue"

import {
  useSignupSideBar,
  useLoginSideBar,
  useSettingSideBar,
  useForgotPasswordSideBar,
} from "~/composables/states"

import { trackClickEvent } from "~/utilities/helpers"

const props = defineProps({
  isRoute: {
    type: Boolean,
    default: false,
  },
})

const settingsSideBar = useSettingSideBar()
const signUpSideBar = useSignupSideBar()
const loginSideBar = useLoginSideBar()
const forgotPasswordSideBar = useForgotPasswordSideBar()

const client = useSupabaseClient()
const config = useRuntimeConfig()

// handle the login and signup sidebars when the user clicks on the sign up link
const onSignupClick = () => {
  if (!props.isRoute) {
    loginSideBar.value = false
    signUpSideBar.value = true
  }
}

// actions to be taken with the login link is clicked
const onLogin = (provider) => {
  trackClickEvent("Click Tracking - log in", "Log In Sidebar - user section", provider)
}

// close all sidebars
const closeAll = () => {
  onLogin("email")
  if (!props.isRoute) {
    loginSideBar.value = false
    signUpSideBar.value = false
    settingsSideBar.value = false
  }
}

// open the forgot password sidebar
const openForgotPassword = () => {
  loginSideBar.value = false
  forgotPasswordSideBar.value = true
}
</script>

<template>
  <div class="login">
    <section>
      <SHeader
        label="Log in"
        @close-sidebar="props.isRoute ? navigateTo('/home') : (loginSideBar = false)"
      />
    </section>
    <section>
      <p>
        Don't have an account yet?
        <VFlexibleLink
          :to="props.isRoute ? '/signup' : '#'"
          aria-label="sign up"
          @click="onSignupClick"
        >
          Sign up
        </VFlexibleLink>
      </p>

      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="google"
        label="Log in with Google"
        severity="secondary"
        class="center my-3"
        @submit-success="onLogin('google')"
      />
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="apple"
        label="Log in with Apple"
        severity="secondary"
        class="center"
        @submit-success="onLogin('apple')"
      />
      <Divider
        class="my-4"
        align="center"
        pt:content:style="background:var(--p-surface-25)"
      >
        <b>or</b>
      </Divider>
      <VLoginWithEmail
        label="Log in"
        :client="client"
        :config="config"
        slug="/confirm"
        @submit-success="closeAll"
      >
        <template #belowSubmit>
          <div class="mt-4 relative">
            <p class="text-center">
              <VFlexibleLink
                to="#"
                class="link m-auto block"
                aria-label="forgot password"
                @click="openForgotPassword"
              >
                Forgot password?
              </VFlexibleLink>
            </p>
          </div>
        </template>
      </VLoginWithEmail>
    </section>
  </div>
</template>
