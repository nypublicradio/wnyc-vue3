<script setup>
import { useToast } from "primevue/usetoast"
import { togglePlayEpisode } from "~/utilities/helpers"
import { useTopStories } from "~/composables/useTopStories"
const { getFilteredTopStories } = useTopStories()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const {
  data: episode,
  status,
  error,
} = useFetch(
  () =>
    `${config.public.BFF_URL}/api/v2/show/episode/${route.params.cmsSource}/${route.params.slug}`,
  {
    key: `index-episode-${route.params.cmsSource}-${route.params.slug}`,
    onResponseError() {
      toast.add({
        severity: "error",
        summary:
          "We are having a problem loading this episode. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)

onMounted(() => {
  if (!episode.value) return
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: episode.value.title,
    page_type: "episode_page",
    content_group: "on_demand_episode",
    article_authors: episode.value?.authors
      ?.map((author) => author.name)
      .join(","),
    article_publish_date: episode.value.publicationDate,
    article_updated_date: episode.value.updatedDate
      ? episode.value.updatedDate
      : episode.value.publicationDate,
    article_title: episode.value.title,
  })

  // check route param autoplay exists and if so, play the first segment
  if (route.query.autoplay === "true") {
    togglePlayEpisode(episode.value.audio[0])
    // remove the autoplay query param
    router.replace({ query: { ...route.query, autoplay: null } })
  }
})

const theSlug = computed(
  () =>
    episode.value?.showSlug ||
    episode.value?.showId ||
    episode.value?.show?.slug ||
    episode.value?.headers?.brand?.slug
)

const { data: showSlug } = useFetch(() =>
  theSlug.value
    ? `${config.public.BFF_URL}/api/v2/show/${theSlug.value}?slugOnly=true`
    : null
)

const { data: show, status: showStatus } = useFetch(() =>
  showSlug.value?.show?.slug
    ? `${config.public.BFF_URL}/api/pages/wagtail/${showSlug.value?.show?.slug}?showOnly=true`
    : null
)

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  {
    label: showSlug.value?.show?.title,
    route: `/browse/shows/${showSlug.value?.show?.slug}`,
  },
  { label: episode.value?.title },
])

useHead(() => ({
  title: `${episode.value?.title} | WNYC`,
  meta: [
    { name: "og:title", content: `${episode.value?.title} | WNYC` },
    { name: "twitter:title", content: `${episode.value?.title} | WNYC` },
  ],
}))
</script>

<template>
  <div class="episode-page">
    <FetchError v-if="error" />
    <template v-else>
      <section class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </section>
      <EpisodeTemplate
        :pending="status !== 'success'"
        :episodeData="episode"
        :show="show"
        :showPending="showStatus === 'pending'"
      >
        <template #bottom>
          <Divider class="mt-8 mb-5" />
          <h2 class="mb-3">Top Stories From Gothamist</h2>
          <TopStories :articles="getFilteredTopStories(episode)" />
        </template>
      </EpisodeTemplate>

      <BackToTopButton />
    </template>
  </div>
</template>

<style lang="scss">
.episode-page {
  min-height: 100vh;
}
.episode-page .segment-list .beforeHack {
  &::before {
    content: "";
    display: block;
    height: 0px;
  }
}

.episode-page .html-convert {
  p {
    line-height: 1.8em;
  }
}
</style>
