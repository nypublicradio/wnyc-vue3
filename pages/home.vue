<script setup>
import {
  goToEpisodePage,
  hasAudio,
  getEpisodeFallBackImage,
  goToNprPage,
} from "~/utilities/helpers"
import { useCurrentEpisode } from "~/composables/states"
import { NativeAudio } from "../plugins/native-audio"

const config = useRuntimeConfig()
const currentEpisode = useCurrentEpisode()

const { data: latestNewsUpdatesData, error: error2 } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagelatestnewsupdates`
)

const { data: topStoriesData, error: error3 } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagetopstories`
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
useHead({
  bodyAttrs: {
    class: "show-header",
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
  window.setInterval(() => {
    NativeAudio.echo("test")
  }, 5000)
  NativeAudio.playAudio("https://hls-live.wnyc.org/wnycfmapp-hls.aac/playlist.m3u8")
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
    <LiveFeature />

    <section>
      <FetchError v-if="error || error2 || error3" />
      <h2 class="mt-4 mb-3">Latest News Updates</h2>
      <LatestNewsUpdates
        :localNewscast="latestNewsUpdatesData?.local_newscast"
        :nationalNewscast="latestNewsUpdatesData?.national_newscast"
      />
    </section>

    <story-htlAd layout="leaderboard" slotClass="htlad-wnyc_homepage_banner" />

    <section>
      <h2 class="mb-3">WNYC Picks</h2>
      <TopStories :articles="topStoriesData?.top_stories" />
      <div class="mx-auto sm:mb-6 md:mt-6" style="width: 300px">
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
    </section>
    <div v-for="section in pagedata?.home_template" :key="section.title">
      <div v-if="section.data.length">
        <section>
          <h2 class="mt-4">{{ section.title }}</h2>
        </section>
        <!-- <pre class="text-xs overflox-hidden">{{ section.data }}</pre> -->
        <section v-if="section.componentType === 'default'">
          <div class="grid">
            <EpisodeItem
              v-for="ep in section.data"
              :data="ep"
              :key="`home-${ep.id}`"
              @onClick="goToEpisodePage(ep)"
              showPlayButton
              :fallback-image="ep.headers.brand.logoImage.template"
              class="col-12 md:col-6 mb-3"
            />
          </div>
        </section>
        <WNYCFeatured v-else class="mt-2" :articles="section.data" />
      </div>
    </div>
    <div v-if="pagedata?.npr_stories?.length">
      <!-- <pre class="text-xs overflow-hidden">npr_stories = {{ pagedata?.npr_stories }}</pre> -->
      <section>
        <h2 class="mb-3">NPR Stories</h2>
        <!--      <pre class="text-xs overflox-hidden">{{ pagedata?.npr_stories }}</pre> -->
        <div
          v-for="(section, index) in pagedata?.npr_stories"
          :key="`NPR-conetnet-${index}`"
        >
          <div v-if="section.componentType === 'default'">
            <div class="grid">
              <div
                class="col-12 md:col-6 mb-3"
                v-for="article in section.articles"
                :key="article.id"
              >
                <EpisodeItem
                  v-if="hasAudio(article.audio)"
                  :data="article"
                  @on-click="goToNprPage(article)"
                  showPlayButton
                  :fallback-image="getEpisodeFallBackImage()"
                  :showShare="false"
                />
                <StoryItem
                  v-else
                  :data="article"
                  :index="index"
                  @on-click="goToNprPage(article)"
                  :showShare="false"
                />
              </div>
            </div>
          </div>
          <WNYCFeatured v-else class="mt-2" :articles="section.articles" />
        </div>
      </section>
    </div>
    <SponsorBanner
      class="mt-4"
      :style="`margin-bottom:${currentEpisode ? '-20px' : '-5rem'}`"
    />
  </div>
</template>
