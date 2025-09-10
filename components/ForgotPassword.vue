<script setup>
import VLoginWithMagicLink from "~/components/supabase/VLoginWithMagicLink.vue"

import { useForgotPasswordSideBar, useIsApp } from "~/composables/states"

const client = useSupabaseClient()
const config = useRuntimeConfig()

const forgotPasswordSideBar = useForgotPasswordSideBar()
const isApp = useIsApp()
</script>

<template>
  <div>
    <section>
      <SHeader
        :showButton="isApp"
        label="Forgot password?"
        @close-sidebar="forgotPasswordSideBar = false"
      />
    </section>
    <section class="text-left">
      <p class="mb-4">
        Please enter your email address below and a magic link will be sent to you. Once
        you click on the magic link and are logged in, you may reset your password on your
        account settings page.
      </p>
      <VLoginWithMagicLink :client="client" :config="config" />
    </section>
  </div>
</template>
