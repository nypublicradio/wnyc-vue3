<script setup>
import { cmsSources } from "~/composables/globals"
import { useTopStories } from "~/composables/useTopStories"
const { topStories } = useTopStories()

const route = useRoute()
const config = useRuntimeConfig()

const storySource = "WNYC"

const breadcrumbs = computed(() => [{ label: "Home", route: "/home" }])

const { data: storyData, status, error } = useFetch(
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
        article_updated_date: res?.updatedDate ? res?.updatedDate : res?.publicationDate,
        article_title: res?.title,
      })
    },
    onResponseError() {
      globalToast.value = {
        severity: "error",
        summary: "We are having a problem loading this story. Please try again later.",
        life: 6000,
        closable: true,
      }
    },
  }
)
</script>

<template>
  <div class="story-page">
    <Html lang="en">
      <Head>
        <Title>{{ storyData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${storyData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${storyData?.title} | WNYC`" />
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center"><Breadcrumbs :items="breadcrumbs" /></div>
      <FetchError v-if="error" />
    </section>

    <EpisodeTemplate :pending="status !== 'success'" :episodeData="storyData" />

    <section v-if="topStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">WNYC Picks</h2>
      <TopStories :articles="topStories" />
    </section>
    <BackToTopButton />
  </div>
</template>
