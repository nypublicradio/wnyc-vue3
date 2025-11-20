<script setup lang="js">

import { useToast } from "primevue/usetoast"
import { useTopStories } from "~/composables/useTopStories"
const { getFilteredTopStories, topStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const toast = useToast()

const { data: events, status, error } = useFetch(
  `${config.public.BFF_URL}/api/events/list`,
  {
    onResponse({ response }) {
      const res = response._data
      console.log("event root response:", res)
      $analytics.sendPageView({
        page_title: "Events Page",
        page_type: "events_page",
        content_group: "events",
      })
    },
    onResponseError() {
      toast.add({
        severity: "error",
        summary: "We are having a problem loading these events. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)

const eventData = computed(() => events.value)

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Events", route: "/events" },
])
</script>

<template>
  <div class="event-page">
    <Html lang="en">
      <Head>
        <Title>Events | WNYC</Title>
        <!-- <Meta name="og:title" :content="`${eventData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${eventData?.title} | WNYC`" /> -->
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
    </section>
    <FetchError v-if="error" />

    <section class="py-6">
      <h1>Events</h1>
      <pre>{{ eventData.events }}</pre>
    </section>

    <section v-if="getFilteredTopStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>

    <BackToTopButton />
  </div>
</template>
