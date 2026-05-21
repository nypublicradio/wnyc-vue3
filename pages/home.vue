<script setup>
import { useCurrentEpisode, useIsApp } from "~/composables/states"
import { useFetchWrapper } from "~/composables/useFetchWrapper"
import { brandCards } from "~/composables/globals.ts"
import useAppSettings from "~/composables/useAppSettings"
useHead({
  bodyAttrs: {
    class: "no-bottom-padding",
  },
})

const config = useRuntimeConfig()
const currentEpisode = useCurrentEpisode()
const isApp = useIsApp()
// get app settings
const { getAppSettings, settings: appSettings } = useAppSettings()
getAppSettings()

const newsFetchArgs = [
  `${config.public.BFF_URL}/api/homepagelatestnewsupdates`,
  {
    key: "home-latest-news-updates",
    retry: 2,
    retryDelay: 500,
  },
]
const curationFetchArgs = [
  `${config.public.BFF_URL}/api/homepagecuration`,
  {
    key: "home-page-curation",
    retry: 2,
    retryDelay: 500,
  },
]

const [
  { data: latestNewsUpdatesData, error: error2 },
  { data: pagedata, error, status },
] = await Promise.all([
  useFetchWrapper(...newsFetchArgs),
  useFetchWrapper(...curationFetchArgs),
])

definePageMeta({
  layout: "default",
  // layoutTransition: {
  //   name: "login",
  // },
})

// Auto-refresh handled by useFetchWrapper
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
  <div class="home">
    <section class="mb-4 pt-0 md:my-4 md:pt-4">
      <div class="home-top grid grid-nogutter gap-4">
        <LiveFeature class="col-12 lg:col -mx-4 md:mx-0 w-screen md:w-full" />
        <div class="latestNewsHolder col">
          <FetchError v-if="error || error2" />
          <h2 class="mt-4 mb-3 lg:mt-0 md:text-lg lg:text-xl">Latest News Updates</h2>
          <LatestNewsUpdates
            :localNewscast="latestNewsUpdatesData?.local_newscast ?? null"
            :nationalNewscast="latestNewsUpdatesData?.national_newscast ?? null"
          />
        </div>
      </div>
      <!-- <VImage src="/fallback-ep.png" /> -->
    </section>
    <!-- <story-htlAd layout="leaderboard" slotClass="htlad-wnyc_homepage_banner" /> -->
    <section>
      <atm-cta v-if="appSettings?.ask_the_mayor" />
    </section>
    <section v-if="status === 'success'">
      <VStreamfield :streamfieldBlocks="pagedata?.new_home_template?.curatedContent" />
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
          <LazyBrandCard :brand="brand" />
        </div>
      </div>
    </section>

    <LazyDonateBanner v-if="!isApp" class="mt-6" />

    <LazySponsorBanner
      v-if="isApp"
      :style="`margin-bottom:${currentEpisode ? '-20px' : '0'}`"
    />
  </div>
</template>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  .home-top {
    .latestNewsHolder {
      width: 100%;
      max-width: 100%;

      @include media(">=lg") {
        max-width: 300px !important;
      }
    }
  }
}
</style>
