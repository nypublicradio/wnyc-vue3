<script setup>
import { goToEpisodePage, hasAudio, getEpisodeFallBackImage } from "~/utilities/helpers"

const config = useRuntimeConfig()
const { data: pagedata, /*  pending, */ error, refresh } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepage`
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
      <FetchError v-if="error || pagedata === undefined" @on-click="refresh" />
      <h2 class="mt-4 mb-3">Latest News Updates</h2>
      <LatestNewsUpdates
        :localNewscast="pagedata?.local_newscast"
        :nationalNewscast="pagedata?.national_newscast"
      />
    </section>
    <section>
      <h2 class="mb-3">Top stories</h2>
      <TopStories :articles="pagedata?.top_stories" />
    </section>
    <div class="mx-auto mb-6" style="width: 300px">
      <story-htlAd
        layout="rectangle"
        slotClass="htlad-wnyc_homepage_rectangle"
        fineprint="Gothamist is funded by sponsors and member donations"
      />
    </div>
    <div v-for="section in pagedata?.home_template" :key="section.title">
      <div v-if="section.data.length">
        <section>
          <h2 class="mt-4">{{ section.title }}</h2>
        </section>
        <section v-if="section.componentType === 'default'">
          <div class="flex flex-column gap-4">
            <EpisodeItem
              v-for="ep in section.data"
              :data="ep"
              :key="`home-${ep.id}`"
              @onClick="goToEpisodePage(ep)"
              showPlayButton
              :fallback-image="ep.headers.brand.logoImage.template"
            />
          </div>
        </section>
        <WNYCFeatured v-else class="mt-2" :articles="section.data" />
      </div>
    </div>

    <pre class="text-xs overflow-hidden">{{ pagedata?.npr_stories }}</pre>
    <section>
      <h2 class="mb-3">NPR Stories</h2>
      <div
        v-for="(section, index) in pagedata?.npr_stories"
        :key="`NPR-conetnet-${index}`"
      >
        <div v-if="section.componentType === 'default'">
          <div class="flex flex-column gap-4">
            <div v-for="article in section.articles" :key="article.id">
              <EpisodeItem
                v-if="hasAudio(article.audio)"
                :data="article"
                @on-click="goToEpisodePage(article)"
                showPlayButton
                :fallback-image="getEpisodeFallBackImage()"
              />
              <StoryItem
                v-else
                :data="article"
                :index="index"
                @on-click="goToStoryPage(article, { src: article.cmsSource })"
              />
              <HtmlConvert :htmlContent="article.body"></HtmlConvert>
            </div>
          </div>
        </div>
        <WNYCFeatured v-else class="mt-2" :articles="section.articles" />
      </div>
    </section>
  </div>
</template>
