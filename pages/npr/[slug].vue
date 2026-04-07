<script setup>
import { useTopStories } from "~/composables/useTopStories"
const { topStories } = useTopStories()

const route = useRoute()
const config = useRuntimeConfig()

const storySource = "NPR"
//const breadcrumbs = computed(() => [{ label: "Home", route: "/home" }])

const {
  data: storyData,
  status,
  error,
} = await useFetch(
  () => `${config.public.BFF_URL}/api/npr/${route.params.slug}`,
  {
    onResponseError() {
      globalToast.value = {
        severity: "error",
        summary:
          "We are having a problem loading this article. Please try again later.",
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
  { label: storyData.value?.title },
])

useHead(() => ({
  title: `${storyData.value?.title} | WNYC`,
  meta: [
    { name: "og:title", content: `${storyData.value?.title} | WNYC` },
    { name: "twitter:title", content: `${storyData.value?.title} | WNYC` },
  ],
}))
</script>

<template>
  <div class="npr-story-page">
    <FetchError v-if="error" />
    <template v-else>
      <section class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
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

<style lang="scss" scoped>
.npr-story-page h1.alt {
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-700);
  line-height: var(--font-size-10);
}

.npr-story-page .star-icon {
  height: 28px;
  width: 28px;
}
.npr-story-page .v-byline .flexible-link {
  color: var(--p-text-color) !important;
  text-decoration: none !important;
}

.npr-story-page .comments-btn {
  .comments-icon {
    margin-top: 3px;
  }
}
</style>

<style lang="scss">
// because it does not saw "read more" right now, we will center the name
.npr-story-page .article-footer .v-person .author-profile {
  align-items: center !important;
}
</style>
