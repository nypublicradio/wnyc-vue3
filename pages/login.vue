<script setup>
definePageMeta({
  middleware: ["check-logged-in"],
  pageTransition: false, // Disable page transition
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Login",
    page_type: "login_page",
    content_group: "login",
  })
})
</script>

<template>
  <Login isRoute />
</template>

<style lang="scss">
.page.login {
  background: var(--p-surface-25);
}
</style>
