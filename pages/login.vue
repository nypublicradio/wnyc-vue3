<script setup>
useHead({
  bodyAttrs: {
    class: "no-bottom-padding",
  },
})
definePageMeta({
  middleware: ["check-logged-in"],
  pageTransition: false, // Disable page transition
})

useHead({
  title:
    "Login | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "Login | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "Login | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
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
  <div class="login-page">
    <section class="grid m-auto pb-0 lg:pr-0 pt-0">
      <Login isRoute class="col-12 lg:col-6" />
      <LoginSignupSideContent class="hidden col-6 lg:flex" />
    </section>
  </div>
</template>

