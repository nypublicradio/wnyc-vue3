<script setup>
import { cmsSources } from "~/composables/globals"
import { useTopStories } from "~/composables/useTopStories"
const { topStories } = useTopStories()

const route = useRoute()
const config = useRuntimeConfig()

const storySource = "WNYC"

const breadcrumbs = computed(() => [{ label: "Home", route: "/home" }])

const storyFetchResult = useFetchWrapper(
  () =>
    `${config.public.BFF_URL}/api/story/${cmsSources.PUBLISHER}/${route.params.slug}`,
  {
    key: `story-${cmsSources.PUBLISHER}-${route.params.slug}`,
    onResponseError() {
      globalToast.value = {
        severity: "error",
        summary:
          "We are having a problem loading this story. Please try again later.",
        life: 6000,
        closable: true,
      }
    },
  }
)

if (import.meta.server) {
  await storyFetchResult
}

const {
  data: storyData,
  status,
  error,
} = storyFetchResult

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

const title = computed(() => storyData.value?.title ? `${storyData.value.title} | WNYC` : 'WNYC')

useHead({
  title,
})
useSeoMeta({
  title,
  ogTitle: title,
})
</script>

<template>
  <div class="story-page">
    <FetchError v-if="error || !storyData" />
    <template v-else>
      <section>
        <div class="flex align-items-center">
          <Breadcrumbs :items="breadcrumbs" />
        </div>
      </section>

      <EpisodeTemplate :pending="status !== 'success'" :episodeData="storyData">
        <template #bottom>
          <Divider class="mt-8 mb-5" />
          <h2 class="mb-3">Top Stories From Gothamist</h2>
          <TopStories :articles="topStories" />
        </template>
      </EpisodeTemplate>
      <BackToTopButton />
    </template>
  </div>
</template>
