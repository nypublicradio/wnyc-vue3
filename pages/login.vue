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
  <div class="login-page mt-4">
    <Html lang="en">
      <Head>
        <Title>
          Login | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News
        </Title>
        <Meta
          name="og:title"
          content="Login | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="Login | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
    <section class="grid m-auto pb-0 lg:pr-0 pt-0">
      <Login isRoute class="col-12 lg:col-6" />
      <LoginSignupSideContent class="hidden col-6 lg:flex" />
    </section>
  </div>
</template>

<style lang="scss">
body {
  main {
    @include media(">=lg") {
      padding-bottom: 0;
    }
  }
}
</style>

<style lang="scss" scoped>
.login-page {
  //background: var(--p-surface-25);
}
</style>
