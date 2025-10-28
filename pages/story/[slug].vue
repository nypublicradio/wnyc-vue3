<script setup>
import { cmsSources } from "~/composables/globals"
import { trackClickEvent } from "~/utilities/helpers"

import { useTopStories } from "~/composables/useTopStories"
const { topStories } = useTopStories()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const isWagtail = route.query.src === cmsSources.WAGTAIL
const storySource = isWagtail ? "Gothamist" : "WNYC"

const { data: storyData, status, error } = useFetch(
  `${config.public.BFF_URL}/api/story/${route.query.src}/${route.params.slug}`,
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

// navigate back to home and track it
const routeBack = () => {
  trackClickEvent("story", "story page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
}
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
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="routeBack"
          label="Back"
        />
      </div>
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
