<script setup>
import { goToEpisodePage } from "~/utilities/helpers"
//import { useUpdateCommentCounts } from "~/composables/comments"

const config = useRuntimeConfig()
const { data: pagedata, pending, error, refresh } = useLazyFetch(
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
    <!-- <ClientOnly>
        <div class="mt-4 container">
          <h3 class="mb-4">Current User:</h3>
          <p class="mb-4">{{ currentUser }}</p>
          <h3 class="mb-4">User Profile Data:</h3>
          <p class="mb-4">{{ currentUserProfile }}</p>
        </div>
      </ClientOnly> -->
    <!-- <FetchError v-if="error" @on-click="refresh" /> -->
    <LiveFeature />
    <!-- <div class="grid gap-3">
        <div class="col-fixed ad300 hidden lg:block">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
        <div class="col-12 ad300 lg:hidden">
          <div class="htlad-wnyc_rectangle"></div>
        </div>
      </div> -->

    <section>
      <h2 class="mt-4 mb-3">Latest News Updates</h2>
      <LatestNewsUpdates
        :localNewscast="pagedata?.local_newscast"
        :nationalNewscast="pagedata?.national_newscast"
      />
    </section>
    <section>
      <h2 class="mb-3">Top stories</h2>
      <!-- <pre class="text-xs" v-if="topStories">{{ topStories.body }}</pre> -->
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
            <!-- <pre class="text-xs">{{ section.data[4] }}</pre> -->
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
