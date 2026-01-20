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
import { useAuthReturnRoute } from "~/composables/useAuthReturnRoute"

const props = defineProps({
  isRoute: {
    type: Boolean,
    default: false,
  },
  returnRoute: {
    type: String,
    default: "/confirm",
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
})

const settingsSideBar = useSettingSideBar()
const signUpSideBar = useSignupSideBar()
const loginSideBar = useLoginSideBar()
const forgotPasswordSideBar = useForgotPasswordSideBar()

const client = useSupabaseClient()
const config = useRuntimeConfig()
const { setAuthReturnRoute, clearAuthReturnRoute } = useAuthReturnRoute()

// handle the login and signup sidebars when the user clicks on the sign up link
const onSignupClick = () => {
  if (!props.isRoute) {
    loginSideBar.value = false
    signUpSideBar.value = true
  } else {
    navigateTo({
      path: "/signup",
    })
  }
  trackClickEvent(
    "Click Tracking - Sign up",
    "Sign Up Sidebar - user section",
    "sign up link"
  )
}

// actions to be taken with the login link is clicked
const onLogin = (provider) => {
  trackClickEvent(
    "Click Tracking - log in",
    "Log In Sidebar - user section",
    provider
  )
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
// handle the close login if on a route or not
const closeLogin = () => {
  props.isRoute ? navigateTo("/home") : (loginSideBar.value = false)
}
</script>

<template>
  <div class="login">
    <div v-if="props.showHeader">
      <slot name="header">
        <SHeader class="pb-4" label="Log in" @close-sidebar="closeLogin" />
        <p>
          Don't have an account yet?
          <VFlexibleLink
            aria-label="sign up"
            @flexible-link-click="onSignupClick"
          >
            Sign up
          </VFlexibleLink>
        </p>
      </slot>
    </div>
    <div class="pt-0">
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="google"
        label="Log in with Google"
        severity="secondary"
        class="center my-3"
        @submit-click="setAuthReturnRoute(props.returnRoute)"
        @submit-error="clearAuthReturnRoute()"
        @submit-success="onLogin('google')"
      />
      <VLoginWithProvider
        :client="client"
        :config="config"
        provider="apple"
        label="Log in with Apple"
        severity="secondary"
        class="center"
        @submit-click="setAuthReturnRoute(props.returnRoute)"
        @submit-error="clearAuthReturnRoute()"
        @submit-success="onLogin('apple')"
      />
      <Divider class="my-4 mask" align="center">
        <b>or</b>
      </Divider>
      <VLoginWithEmail
        label="Log in"
        :client="client"
        :config="config"
        :returnRoute="props.returnRoute"
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
    </div>
  </div>
</template>
