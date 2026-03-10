<script setup>
import { useCurrentEpisode, useIsApp } from "~/composables/states"
// import { useTopStories } from "~/composables/useTopStories"
// const { topStories } = useTopStories()
import { brandCards } from "~/composables/globals.ts"

useHead({
  bodyAttrs: {
    class: "no-bottom-padding",
  },
})

const config = useRuntimeConfig()
const currentEpisode = useCurrentEpisode()
const isApp = useIsApp()

const { data: latestNewsUpdatesData, error: error2 } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagelatestnewsupdates`
)

const {
  data: pagedata,
  error,
  status,
} = useLazyFetch(`${config.public.BFF_URL}/api/homepagecuration`)

definePageMeta({
  layout: "default",
  layoutTransition: {
    name: "login",
  },
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Home",
    page_type: "home_page",
    content_group: "home",
  })
})
</script>

<template>
  <div>
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

    <section class="mb-4 pt-0 md:my-4 md:pt-4">
      <div class="home-top grid grid-nogutter gap-4">
        <LiveFeature class="col-12 lg:col -mx-4 md:mx-0 w-screen md:w-full" />
        <div class="latestNewsHolder col">
          <FetchError v-if="error || error2" />
          <h2 class="mt-4 mb-3 lg:mt-0 md:text-lg lg:text-xl">
            Latest News Updates
          </h2>
          <LatestNewsUpdates
            :localNewscast="latestNewsUpdatesData?.local_newscast"
            :nationalNewscast="latestNewsUpdatesData?.national_newscast"
          />
        </div>
      </div>
      <!-- <VImage src="/fallback-ep.png" /> -->
    </section>
    <pre>{{ pagedata?.new_home_template.curatedContent }}</pre>
    <story-htlAd layout="leaderboard" slotClass="htlad-wnyc_homepage_banner" />

    <section v-if="status === 'success'">
      <VStreamfield
        :streamfieldBlocks="pagedata?.new_home_template.curatedContent"
      />
    </section>
    <section v-else>
      <layouts-horizontal-feature-ad-skeleton />
    </section>

    <section>
      <div class="grid grid-lggutter mobile-lggutter">
        <div
          v-for="brand in brandCards"
          class="station-holder desktop item col-6 md:col-4 xl:col-2"
          :key="brand.label"
        >
          <BrandCard :brand="brand" />
        </div>
      </div>
    </section>

    <DonateBanner v-if="!isApp" class="mt-6" />

    <SponsorBanner
      v-if="isApp"
      :style="`margin-bottom:${currentEpisode ? '-20px' : '0'}`"
    />
  </div>
</template>

<style lang="scss" scoped>
.home-top {
  .latestNewsHolder {
    width: 100%;
    max-width: 100%;

    @include media(">=lg") {
      max-width: 300px !important;
    }
  }
}
</style>
