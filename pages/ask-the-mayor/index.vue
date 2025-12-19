
<script setup>
import { useToast } from "primevue/usetoast"

const toast = useToast()

const user = useCurrentUser()

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor",
    page_type: "ask_the_mayor",
    content_group: "ask_the_mayor",
  })
})

const startRecording = () => {
  navigateTo("/ask-the-mayor/submission")
}
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
      <h1>Ask the Mayor</h1>
      <NuxtLink to="/ask-the-mayor-dashboard">Temp Dashboard Link</NuxtLink>

      <p class="my-6">
        Mayor Zohran Mamdani will be joining The Brian Lehrer Show every week
        for Ask the Mayor. Do you have a question for the mayor? Upload a video
        of yourself asking it. We’ll review all the submissions and may use some
        on the air. We’ll also take questions live by phone or text. Be sure to
        start your video by saying your first name and where you live. Keep your
        question brief — no more than 30 seconds.
      </p>

      <Button label="Start recording" @click="startRecording" />
    </section>
  </div>
</template>
<style lang="scss">
</style>