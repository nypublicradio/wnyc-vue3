<script setup>
definePageMeta({
  middleware: ["check-logged-in"],
  pageTransition: false, // Disable page transition
})
onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Sign up",
    page_type: "signup_page",
    content_group: "signup",
  })
})
</script>

<template>
  <Signup isRoute />
</template>

<style lang="scss">
.page.signup {
  background: var(--p-surface-25);
}
</style>
