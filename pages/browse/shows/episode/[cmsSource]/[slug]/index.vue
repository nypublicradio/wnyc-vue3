<script setup>
import { useToast } from "primevue/usetoast"
import {
  getFirstSentence,
  isolateSlug,
  stripHtmlTags,
  togglePlayEpisode,
} from "~/utilities/helpers"
import { useTopStories } from "~/composables/useTopStories"
import { getSimplecastEpisodeTitle, getSimplecastEpisodeDescription, getSimplecastEpisodeImage } from "~/utilities/metadataHelpers"
const { getFilteredTopStories } = useTopStories()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const [{ data: episode, status, error }, { data: redirectsData }] =
  await Promise.all([
    useFetchWrapper(
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
    ),
    useFetchWrapper(() => `${config.public.BFF_URL}/api/show-slug-redirects`, {
      key: "show-slug-redirects",
    }),
  ])

const filteredTopStories = computed(() => getFilteredTopStories(episode.value))

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

// Simplecast episodes have showSlug/showId — fetch show info by UUID
const theSlug = computed(
  () =>
    episode.value?.showSlug ||
    episode.value?.showId ||
    episode.value?.show?.slug ||
    episode.value?.headers?.brand?.slug ||
    null
)

const { data: showSlug } = await useFetchWrapper(
  () =>
    theSlug.value
      ? `${config.public.BFF_URL}/api/v2/show/${theSlug.value}?slugOnly=true`
      : null,
  {
    key: `v2-show-only-${theSlug.value}`,
  }
)

// Redirect table for old publisher show slugs
// (Fetch moved to Promise.all above for parallel execution)

// Resolve the show slug: redirect table first, then simplecast, then raw fallback
const resolvedShowSlug = computed(() => {
  // 1. check redirect table for updated slug
  const headerSlug = episode.value?.headers?.links?.find(
    (link) => link.itemType === "show"
  )?.slug

  if (headerSlug) {
    const redirect = redirectsData.value?.find(
      (r) => isolateSlug(r.from) === headerSlug
    )
    return redirect ? isolateSlug(redirect.to) : headerSlug
  }

  // 2. Simplecast path fallback
  if (showSlug.value?.show?.slug) return showSlug.value.show.slug

  // 3. Raw fallbacks
  return (
    episode.value?.show?.slug || episode.value?.headers?.brand?.slug || null
  )
})

const { data: show, status: showStatus } = await useFetchWrapper(
  () =>
    resolvedShowSlug.value
      ? `${config.public.BFF_URL}/api/pages/wagtail/${resolvedShowSlug.value}?showOnly=true`
      : null,
  {
    key: `wagtail-show-only-${resolvedShowSlug.value}`,
  }
)

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  {
    label: show.value?.title,
    route: `/browse/shows/${resolvedShowSlug.value}`,
  },
  { label: episode.value?.title },
])

const title = getSimplecastEpisodeTitle(episode)
const description = getSimplecastEpisodeDescription(episode)
const image = getSimplecastEpisodeImage(episode, show)
useHead({
  title,
})
useSeoMeta({
  title,
  description: description,
  ogTitle: title,
  ogDescription: description,
})
if (image) {
  useSeoMeta({
    ogImage: image,
  })
}
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
          <TopStories :articles="filteredTopStories" />
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
