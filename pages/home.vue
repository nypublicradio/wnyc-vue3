<script setup>
import { goToEpisodePage } from "~/utilities/helpers"
//import { useUpdateCommentCounts } from "~/composables/comments"

const config = useRuntimeConfig()
const { data: pagedata } = useLazyFetch(`${config.public.BFF_URL}/api/homepage`)
const homeTemplate = ref(pagedata?.value?.home_template ?? null)
const topStories = ref(pagedata?.value?.top_stories ?? null)
const localNewscast = ref(pagedata?.value?.local_newscast ?? null)
const nationalNewscast = ref(pagedata?.value?.national_newscast ?? null)

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

const stopWatch = watch(pagedata, () => {
  homeTemplate.value = pagedata.value.home_template
  topStories.value = pagedata.value.top_stories
  localNewscast.value = pagedata.value.local_newscast
  nationalNewscast.value = pagedata.value.national_newscast
  // Stop watching after the first change
  nextTick(() => {
    stopWatch()
  })
})

onMounted( () => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView( {
    page_title: 'Home',
    page_type: 'home_page',
    content_group: 'home',
  } )
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
        :localNewscast="localNewscast"
        :nationalNewscast="nationalNewscast"
      />
    </section>
    <section>
      <h2 class="mb-3">Top stories</h2>
      <!-- <pre class="text-xs" v-if="topStories">{{ topStories.body }}</pre> -->
      <TopStories :articles="topStories" />
    </section>
    <div class="mx-auto mb-6" style="width: 300px">
      <story-htlAd
        layout="rectangle"
        slotClass="htlad-wnyc_homepage_rectangle"
        fineprint="Gothamist is funded by sponsors and member donations"
      />
    </div>
    <div v-for="section in homeTemplate" :key="section.title">
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
