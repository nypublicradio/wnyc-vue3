<script setup>
import { cmsSources } from "~/composables/globals"
import { useTopStories } from "~/composables/useTopStories"
const { topStories } = await useTopStories()

const route = useRoute()
const config = useRuntimeConfig()

const storySource = "WNYC"

const breadcrumbs = computed(() => [{ label: "Home", route: "/home" }])

const {
  data: storyData,
  status,
  error,
} = useFetch(
  `${config.public.BFF_URL}/api/story/${cmsSources.PUBLISHER}/${route.params.slug}`,
  {
    onResponse({ response }) {
      const res = response._data
      // send GA page view
      const { $analytics } = useNuxtApp()
      $analytics.sendPageView({
        page_title: res?.title,
        page_type: "article",
        content_group: `${storySource}_article`,
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res?.publicationDate,
        article_updated_date: res?.updatedDate
          ? res?.updatedDate
          : res?.publicationDate,
        article_title: res?.title,
      })
    },
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

useHead(() => ({
  title: `${storyData.value?.title} | WNYC`,
  meta: [
    { name: "og:title", content: `${storyData.value?.title} | WNYC` },
    { name: "twitter:title", content: `${storyData.value?.title} | WNYC` },
  ],
}))
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
