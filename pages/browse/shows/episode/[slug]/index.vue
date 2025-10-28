<script setup>
import { useToast } from "primevue/usetoast"
import { trackClickEvent, togglePlayEpisode } from "~/utilities/helpers"
import { useTopStories } from "~/composables/useTopStories"
import EpisodeTemplate from "~/components/EpisodeTemplate.vue"
const { getFilteredTopStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const { data: episode, status, error } = useFetch(
  `${config.public.BFF_URL}/api/v2/show/episode/${route.query.src}/${route.params.slug}`,
  {
    onResponse({ response }) {
      const res = response._data
      $analytics.sendPageView({
        page_title: res.title,
        page_type: "episode_page",
        content_group: "on_demand_episode",
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res.publicationDate,
        article_updated_date: res.updatedDate ? res.updatedDate : res.publicationDate,
        article_title: res.title,
      })

      // check route param autoplay exists and if so, play the first segment
      if (route.query.autoplay === "true") {
        togglePlayEpisode(res.audio[0])
        // remove the autoplay query param
        router.replace({ query: { ...route.query, autoplay: null } })
      }
    },
    onResponseError() {
      toast.add({
        severity: "error",
        summary: "We are having a problem loading this episode. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)

const episodeData = computed(() => episode.value)

const theSlug = computed(
  () =>
    episodeData.value?.showSlug ||
    episodeData.value?.show ||
    episodeData.value?.headers.brand.slug
)

// navigate back to home and track it
const backHome = () => {
  trackClickEvent("episode", "episode page", "back show page")
  router.go(-1)
}

const {
  data: show,
  status: showStatus,
  error: showError,
  execute: executeShowFetch,
} = useLazyFetch(() => `${config.public.BFF_URL}/api/v2/show/${theSlug.value}`, {
  immediate: false,
  server: false,
})

watch(
  status,
  () => {
    if (status.value === "success" && theSlug.value) {
      executeShowFetch()
    }
  },
  { immediate: false }
)
</script>

<template>
  <div class="episode-page">
    <Html lang="en">
      <Head>
        <Title>{{ episodeData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${episodeData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${episodeData?.title} | WNYC`" />
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="backHome"
          label="Back"
        />
      </div>
    </section>
    <FetchError v-if="error" />
    <FetchError v-if="showError" />

    <EpisodeTemplate
      :pending="status !== 'success'"
      :episodeData="episodeData"
      :show="show"
      :showPending="showStatus === 'pending'"
    />

    <section v-if="getFilteredTopStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="getFilteredTopStories(episodeData)" />
    </section>

    <BackToTopButton />
  </div>
</template>

<style lang="scss">
.episode-page .segment-list .beforeHack {
  &::before {
    content: "";
    display: block;
    height: 0px;
  }
}
.episode-page .episode-page-image {
  aspect-ratio: 3/2;
}
.episode-page .html-convert {
  p {
    line-height: 1.8em;
  }
}
</style>
