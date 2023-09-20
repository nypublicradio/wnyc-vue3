<script setup>
import VSignupWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VSignupWithEmail.vue'
//import VLoginWithEmail from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithEmail.vue'
import VLoginWithProvider from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithProvider.vue'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

import {
  useSignupSideBar,
  useLoginSideBar,
  useSettingSideBar,
} from '~/composables/states'

const settingsSideBar = useSettingSideBar()
const signUpSideBar = useSignupSideBar()
const loginSideBar = useLoginSideBar()

const client = useSupabaseClient()
const config = useRuntimeConfig()

// handle the login and signup sidebars when the user clicks on the login link
const onLoginClick = () => {
  loginSideBar.value = true
  signUpSideBar.value = false
}

// close all sidebars
const closeAll = () => {
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
        @login-success="closeAll"
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
