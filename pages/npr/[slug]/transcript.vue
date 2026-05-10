<script setup>
import { getFirstSentence, stripHtmlTags } from "~/utilities/helpers"

const route = useRoute()
const config = useRuntimeConfig()

const storySource = "NPR"

const {
  data: storyData,
  status,
  error,
} = await useFetchWrapper(
  () => `${config.public.BFF_URL}/api/npr/${route.params.slug}`,
  {
    key: `npr-story-transcript-${route.params.slug}`,
    onResponseError() {
      globalToast.value = {
        severity: "error",
        summary:
          "We are having a problem loading this transcript. Please try again later.",
        life: 6000,
        closable: true,
      }
    },
  }
)

onMounted(() => {
  if (!storyData.value) return
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: storyData.value?.title,
    page_type: "article",
    content_group: `${storySource}_article`,
    article_authors: storyData.value?.authors
      ?.map((author) => author.name)
      .join(","),
    article_publish_date: storyData.value?.publicationDate,
    article_updated_date: storyData.value?.updatedDate
      ? storyData.value?.updatedDate
      : storyData.value?.publicationDate,
    article_title: storyData.value?.title,
  })
})

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  ...(storyData.value?.meta?.showSlug
    ? [
        { label: "Browse", route: "/browse" },
        {
          label: storyData.value?.showTitle,
          route: `/browse/shows/${storyData.value?.meta?.showSlug}`,
        },
      ]
    : []),
  { label: storyData.value?.title, route: `/npr/${route.params.slug}` },
  { label: "Transcript" },
])

const title = `${storyData.value?.title} | WNYC`
const tease =
  storyData.value?.tease ?? getFirstSentence(stripHtmlTags(storyData.value?.tease))
const description =
  storyData.value?.description ??
  getFirstSentence(stripHtmlTags(storyData.value?.description))
useHead({
  title,
})
useSeoMeta({
  title,
  description: tease ?? description,
})
</script>

<template>
  <TranscriptTemplate
    :status="status"
    :error="error"
    :episode="storyData"
    :breadcrumbs="breadcrumbs"
    :backToEpisodePath="`/npr/${route.params.slug}`"
  />
</template>
