
<script setup>
import { trackClickEvent } from "~/utilities/helpers"

useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu",
  },
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Ask the Mayor Landing Page",
    page_type: "ask_the_mayor_page",
    content_group: "ask_the_mayor",
  })
})

const getStarted = () => {
  trackClickEvent(
    "Click Tracking - Get Started",
    "CTA on the Home Landing Page",
    "Ask The Mayor Get Started"
  )
  navigateTo("/ask-the-mayor/submission")
}

const readGuidelines = () => {
  trackClickEvent(
    "Click Tracking - Read Guidelines",
    "CTA on the Home Landing Page",
    "Ask The Mayor Guidelines"
  )
  //navigateTo("/ask-the-mayor/guidelines")
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
      <SHeader
        class="pb-4"
        label="Ask the Mayor"
        @close-sidebar="() => navigateTo('/home')"
      />
      <!-- <NuxtLink to="/ask-the-mayor-dashboard">Temp Dashboard Link</NuxtLink> -->

      <Stepper>
        <StepPanels>
          <StepPanel>
            <div class="flex flex-col">
              <div class="step-content">
                <div class="flex flex-column gap-1">
                  <h2>Have a question for the Mayor?</h2>
                  <p>
                    Mayor Mamdani will be joining The Brian Lehrer Show every
                    week to answer your questions.
                  </p>
                </div>
              </div>
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>

      <img
        src="/atm/banner.png"
        loading="eager"
        width="100%"
        height="auto"
        class="my-3"
      />

      <h2>How it works</h2>
      <p class="my-3 line-height-3">
        Create a WNYC account to upload a video of yourself asking a question.
        Be sure to start your video by saying your first name and where you
        live. Keep your question brief — no more than 30 seconds. We’ll review
        all the submissions and may use some on the air during the show!
      </p>

      <v-flexible-link
        @click="readGuidelines"
        to="/ask-the-mayor/guidelines"
        class="text-sm"
        >Read full submission guidelines</v-flexible-link
      >

      <Button label="Get Started" @click="getStarted" class="w-full mt-4" />
    </section>
  </div>
</template>
<style lang="scss">
</style>