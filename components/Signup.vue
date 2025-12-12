<script setup>
import VSignupWithEmail from "~/components/supabase/VSignupWithEmail.vue"
//import VLoginWithEmail from '~/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from "~/components/supabase/VLoginWithProvider.vue"

import { useSignupSideBar, useLoginSideBar, useSettingSideBar } from "~/composables/states"

import { trackClickEvent } from "~/utilities/helpers"

const props = defineProps({
  isRoute: {
    type: Boolean,
    default: false,
  },
  returnRoute: {
    type: String,
    default: null,
  },
})

const settingsSideBar = useSettingSideBar()
const signUpSideBar = useSignupSideBar()
const loginSideBar = useLoginSideBar()

const client = useSupabaseClient()
const route = useRoute()
const config = useRuntimeConfig()
const theReturnRoute = props.returnRoute || route.query.returnRoute

// handle the login and signup sidebars when the user clicks on the login link
const onLoginClick = () => {
  if (!props.isRoute) {
    loginSideBar.value = true
    signUpSideBar.value = false
  } else {
    navigateTo({
      path: "/login",
      query: { returnRoute: theReturnRoute },
    })
  }
  trackClickEvent("Click Tracking - log in", "Sign Up Sidebar - user section", "log in link")
}

// actions to be taken with the signup link is clicked
const onSignup = (provider) => {
  trackClickEvent("Click Tracking - sign up", "Sign Up Sidebar - user section", provider)
}

// close all sidebars
const closeAll = () => {
  onSignup("email")
  if (!props.isRoute) {
    loginSideBar.value = false
    signUpSideBar.value = false
    settingsSideBar.value = false
  }
}
</script>

<template>
  <div class="signup">
    <section>
      <SHeader label="Sign up" @close-sidebar="props.isRoute ? navigateTo('/home') : (signUpSideBar = false)" />
    </section>
    <section>
      <p>
        Already have an account?
        <VFlexibleLink aria-label="log in" @flexible-link-click="onLoginClick"> Log in </VFlexibleLink>
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
      <Divider class="my-4" align="center" pt:content:style="background:var(--p-surface-25)">
        <b>or</b>
      </Divider>
      <VSignupWithEmail
        :client="client"
        :config="config"
        label="Sign up"
        :slug="theReturnRoute"
        @login-success="closeAll"
        redirectUrl="https://demo.native-app.wnyc.org"
      >
        <template #aboveSubmit>
          <p class="mb-3">
            By proceeding to create your account, you are agreeing to New York Public Radio's
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
