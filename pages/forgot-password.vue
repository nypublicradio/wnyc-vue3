<script setup>
definePageMeta({
  middleware: ["check-logged-in"],
  pageTransition: false, // Disable page transition
})

useHead({
  title:
    "Forgot Password | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "Forgot Password | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "Forgot Password | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Forgot Password",
    page_type: "forgot_password_page",
    content_group: "login",
  })
})
</script>

<template>
  <div class="forgot-password-page mt-4">
    <section class="grid m-auto pb-0 lg:pr-0 pt-0">
      <ForgotPassword class="col-12 lg:col-6" />
      <LoginSignupSideContent class="hidden col-6 lg:flex" />
    </section>
  </div>
</template>

<style lang="scss">
body {
  main {
    .forgot-password-page {
      @include media(">=lg") {
        padding-bottom: 0;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.forgot-password-page {
  //background: var(--p-surface-25);
}
</style>
