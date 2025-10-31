<script async setup>
import VLoginWithEmail from "~/components/supabase/VLoginWithEmail.vue"
import VLoginWithProvider from "~/components/supabase/VLoginWithProvider.vue"

import {
  useSignupSideBar,
  useLoginSideBar,
  useSettingSideBar,
  useForgotPasswordSideBar,
  useIsApp,
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
const isApp = useIsApp()

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
  if (isApp.value) {
    loginSideBar.value = false
    forgotPasswordSideBar.value = true
  } else {
    navigateTo("/forgot-password")
  }
}
</script>

<template>
  <div class="login">
    <section>
      <SHeader
        label="Log in"
        :showButton="isApp"
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
      <!--  pt:content:style="background:var(--p-surface-25)" -->
      <Divider class="my-4 mask" align="center">
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
          <div class="mt-4 relative w-full">
            <Button
              severity="secondary"
              variant="link"
              class="link m-auto block"
              @click="openForgotPassword"
              label="Forgot password?"
            ></Button>
          </div>
        </template>
      </VLoginWithEmail>
    </section>
  </div>
</template>
