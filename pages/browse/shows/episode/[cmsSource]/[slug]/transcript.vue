<script setup>
import { useToast } from "primevue/usetoast"
import {
  togglePlayEpisode,
} from "~/utilities/helpers"
import { getSimplecastEpisodeTitle, getSimplecastEpisodeDescription, getSimplecastEpisodeImage } from "~/utilities/metadataHelpers"
import { mediaTypeRoutes } from "~/composables/globals"
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
definePageMeta({
  pageTransition: false,
})

const {
  data: episode,
  status,
  error,
} = await useFetchWrapper(
  () =>
    `${config.public.BFF_URL}/api/v2/show/episode/${route.params.cmsSource}/${route.params.slug}`,
  {
    key: `transcript-episode-${route.params.cmsSource}-${route.params.slug}`,
    onResponseError() {
      toast.add({
        severity: "error",
        summary:
          "We are having a problem loading this episode's transcript. Please try again later.",
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
    content_group: "on_demand_episode_transcript",
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
    episode.value?.show ||
    episode.value?.headers?.brand?.slug
)
const backToEpisodePath = computed(
  () =>
    `${mediaTypeRoutes.episode}${route.params.cmsSource}/${route.params.slug}`
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

const { data: show, status: showStatus } = await useFetchWrapper(
  () =>
    showSlug.value?.show?.slug
      ? `${config.public.BFF_URL}/api/pages/wagtail/${showSlug.value?.show?.slug}?showOnly=true`
      : null,
  {
    key: `wagtail-show-only-${showSlug.value?.show?.slug}`,
  }
)

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  {
    label: showSlug.value?.show?.title,
    route: `/browse/shows/${showSlug.value?.show?.slug}`,
  },
  { label: episode.value?.title, route: backToEpisodePath.value },
  { label: "Transcript" },
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
  <TranscriptTemplate
    :status="status"
    :error="error"
    :episode="episode"
    :show="show"
    :showStatus="showStatus"
    :breadcrumbs="breadcrumbs"
    :backToEpisodePath="backToEpisodePath"
  />
</template>
