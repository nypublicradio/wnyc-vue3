<script setup>
import VLoginWithMagicLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/supabase/VLoginWithMagicLink.vue'
</script>

<template>
  <section class="text-center">
    <h1 class="mb-6">Forgot your password?</h1>
    <p class="mb-4 lg:w-7 m-auto">
      Please enter your email address below and a magic link will be sent to
      you. Once you click on the magic link and are logged in, you may reset
      your password on your account settings page.
    </p>
    <VLoginWithMagicLink
      :client="useSupabaseClient()"
      :config="useRuntimeConfig()"
    />
  </section>
</template>
