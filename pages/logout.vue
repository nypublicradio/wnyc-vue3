<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
useHead({
  bodyAttrs: {
    class: 'hide-header hide-bottom-menu background-gradient style-mode-dark',
  },
})
definePageMeta({
  middleware: 'logout',
})
</script>

<template>
  <div class="text-center">
    <p class="mb-2">
      You have been logged out.
      <VFlexibleLink to="/login"
        >Click here to return to the login page.</VFlexibleLink
      >
    </p>
  </div>
</template>
