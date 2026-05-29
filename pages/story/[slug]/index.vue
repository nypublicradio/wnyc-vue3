<script setup>
import { cmsSources } from "~/composables/globals"
import { useTopStories } from "~/composables/useTopStories"
import {
  getPublisherStoryTitle,
  getPublisherStoryDescription,
  getPublisherStoryImage,
  getPublisherSocialImage,
} from "~/utilities/metadataHelpers"
const { getFilteredTopStories } = useTopStories()

const route = useRoute()
const config = useRuntimeConfig()

const storySource = "WNYC"

const breadcrumbs = computed(() => [{ label: "Home", route: "/home" }])

const storyUrl = `${config.public.BFF_URL}/api/story/${
  route?.query?.src || cmsSources.PUBLISHER
}/${route.params.slug}`

const {
  data: storyData,
  status,
  error,
} = await useFetchWrapper(() => storyUrl, {
  key: `story-${route?.query?.src || cmsSources.PUBLISHER}-${
    route.params.slug
  }`,
  onResponseError() {
    globalToast.value = {
      severity: "error",
      summary:
        "We are having a problem loading this story. Please try again later.",
      life: 6000,
      closable: true,
    }
  },
})

const filteredTopStories = computed(() =>
  getFilteredTopStories(storyData.value)
)

if (storyData.value?.redirect) {
  await navigateTo(storyData.value.location, {
    redirectCode: storyData.value.statusCode || 301,
    external: /^https?:\/\//.test(storyData.value.location),
  })
}

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

const title = getPublisherStoryTitle(storyData)
const description = getPublisherStoryDescription(storyData)
const image = getPublisherStoryImage(storyData)
const socialImage = getPublisherSocialImage(storyData)
useHead(() => ({
  title,
}))
useSeoMeta({
  title,
  description: description,
  ogDescription: description,
  ogTitle: title,
})
if (socialImage || image) {
  useSeoMeta({
    ogImage: socialImage || image,
  })
}
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
          <TopStories :articles="filteredTopStories" />
        </template>
      </EpisodeTemplate>
      <BackToTopButton />
    </template>
  </div>
</template>
