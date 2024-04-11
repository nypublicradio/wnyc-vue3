<script setup>
import { goToEpisodePage } from "~/utilities/helpers"

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
      <h2 class="mb-3">WNYC Picks</h2>
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
        <WNYCFeatured class="mt-2" v-else :articles="section.data" />
      </div>
    </div>
  </div>
</template>
