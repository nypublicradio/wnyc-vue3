<script setup>
import { useCurrentEpisode, useIsApp } from "~/composables/states"
import { useTopStories } from "~/composables/useTopStories"
import { dynamicNavigation } from "~/utilities/helpers"
const { topStories } = useTopStories()
const config = useRuntimeConfig()
const currentEpisode = useCurrentEpisode()
const isApp = useIsApp()

const { data: latestNewsUpdatesData, error: error2 } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagelatestnewsupdates`
)

const { data: pagedata, error } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagecuration`
)

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
        <Title>WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News</Title>
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
          <h2 class="mt-4 mb-3 lg:mt-0 md:text-lg lg:text-xl">Latest News Updates</h2>
          <LatestNewsUpdates
            :localNewscast="latestNewsUpdatesData?.local_newscast"
            :nationalNewscast="latestNewsUpdatesData?.national_newscast"
          />
        </div>
      </div>
    </section>

    <story-htlAd layout="leaderboard" slotClass="htlad-wnyc_homepage_banner" />

    <section>
      <div
        class="ad-holder col mb-6 flex lg:hidden align-items-center justify-content-center"
      >
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
      <h2 class="mb-3">WNYC Picks</h2>
      <TopStories :articles="topStories" />
      <div class="mx-auto sm:mb-6 md:mt-6" style="width: 300px">
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
    </section>

    <DonateBanner class="my-6" />
    <pre class="text-xs">{{ pagedata?.home_template }}</pre>
    ########
    <pre class="text-xs">{{ pagedata?.new_home_template }}</pre>
    <div v-for="section in pagedata?.home_template" :key="section.title">
      <div v-if="section.data.length">
        <section>
          <h2>{{ section.title }}</h2>
        </section>
        <section v-if="section.componentType === 'default'">
          <div class="grid">
            <MediaCard
              v-for="ep in section.data"
              :data="ep"
              :key="`home-${ep.id}`"
              showPlayButton
              :fallback-image="ep.headers.brand.logoImage.template"
              is-horizontal
              imgCol="w-7rem"
              :showBg="false"
              :showBgMobile="false"
              class="col-12 lg:col-6 xl:col-4 mb-3"
              @on-click="dynamicNavigation(ep)"
            />
          </div>
        </section>
        <WNYCFeatured v-else class="mt-2 mb-4" :articles="section.data" />
      </div>
    </div>
    <div v-if="pagedata?.npr_stories?.length">
      <section>
        <h2 class="my-3">NPR Stories</h2>
        <div
          v-for="(section, index) in pagedata?.npr_stories"
          :key="`NPR-content-${index}`"
        >
          <div v-if="section.componentType === 'default'">
            <div class="grid">
              <MediaCard
                class="col-12 lg:col-6 xl:col-4 mb-3"
                v-for="article in section.articles"
                :key="article.id"
                :data="article"
                is-horizontal
                imgCol="w-7rem"
                :index="index"
                :showBg="false"
                :showBgMobile="false"
                @on-click="dynamicNavigation(article)"
              />
            </div>
          </div>
          <WNYCFeatured v-else class="mt-2" :articles="section.articles" />
        </div>
      </section>
    </div>
    <SponsorBanner
      v-if="isApp"
      class="mt-4"
      :style="`margin-bottom:${currentEpisode ? '-20px' : '-5rem'}`"
    />
  </div>
</template>

<style lang="scss" scoped>
.home-top {
  .latestNewsHolder {
    width: 100%;
    max-width: 100%;

    @include media(">lg") {
      max-width: 300px !important;
    }
  }
}
</style>
