<script setup lang="js">

import { useToast } from "primevue/usetoast"
import { togglePlayEpisode } from "~/utilities/helpers"
import { useTopStories } from "~/composables/useTopStories"
import EpisodeTemplate from "~/components/EpisodeTemplate.vue"
const { getFilteredTopStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const { data: event, status, error } = useFetch(
  `${config.public.BFF_URL}/api/events/${route.params.slug}`,
  {
    onResponse({ response }) {
      const res = response._data
      console.log("event response:", response)
      $analytics.sendPageView({
        page_title: res.title,
        page_type: "event_page",
        content_group: "on_demand_event",
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res.publicationDate,
        article_updated_date: res.updatedDate ? res.updatedDate : res.publicationDate,
        article_title: res.title,
      })
    },
    onResponseError() {
      toast.add({
        severity: "error",
        summary: "We are having a problem loading this event. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)

// const eventData = computed(() => event.value)

// const theSlug = computed(
//   () =>
//     eventData.value?.showSlug ||
//     eventData.value?.show ||
//     eventData.value?.headers.brand.slug
// )

// const theShowTitle = computed(
//   () =>
//     eventData.value?.showTitle ||
//     eventData.value?.headers.brand.title ||
//     eventData.value?.title
// )

// const breadcrumbs = computed(() => [
//   { label: "Home", route: "/home" },
//   { label: "Events", route: "/events" },
//   { label: theShowTitle.value, route: `/events/${theSlug.value}` },
// ])
</script>

<template>
  <div class="event-page">
    <!-- <Html lang="en">
      <Head>
        <Title>{{ eventData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${eventData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${eventData?.title} | WNYC`" />
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
    </section>
    <FetchError v-if="error" />
    <FetchError v-if="showError" />
    <section class="py-6">
      <h1>This Event</h1>
    </section>

    <section v-if="getFilteredTopStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="getFilteredTopStories(episodeData)" />
    </section>

    <BackToTopButton /> -->
  </div>
</template>
