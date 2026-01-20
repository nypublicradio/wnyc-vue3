
<script setup>
useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu",
  },
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor Guidelines",
    page_type: "ask_the_mayor_page",
    content_group: "ask_the_mayor",
  })
})
</script>

<template>
  <div class="ask-the-mayor">
    <Html lang="en">
      <Head>
        <Title
          >WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>

    <section>
      <SHeader
        class="pb-4"
        label="Back"
        @close-sidebar="() => navigateTo('/ask-the-mayor')"
      />

      <h2>Submission Guidelines</h2>
      <p class="my-3 line-height-3">
        Rotate your phone so it is upright, and shoot your video vertically.
        Center yourself in the middle of the frame and make sure you're in a
        quiet, well-lit place when you film your video. Try finding a spot where
        you can stabilize your phone to avoid shaking.
      </p>
      <p class="my-3 line-height-3">
        Check your background before you film and make sure it's appropriate. We
        can't play obscenities or expletives on the radio, so please don't use
        them in your question.
      </p>
      <p class="my-3 line-height-3">
        Videos are limited to 30 seconds. If we use your question, we may edit
        it for clarity.
      </p>
      <p class="my-3 line-height-3">
        We won't be able to use or respond to every video we receive. Even if we
        don't play your question on the air, however, we will review it so we
        can inform our programming.
      </p>
    </section>
  </div>
</template>
