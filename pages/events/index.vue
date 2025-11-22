<script setup lang="js">
import { dynamicNavigation } from "~/utilities/helpers"
import { useToast } from "primevue/usetoast"
import { useTopStories } from "~/composables/useTopStories"
const { getFilteredTopStories, topStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const toast = useToast()

const { data: events, status, error } = useFetch(
  `${config.public.BFF_URL}/api/events/list`,
  {
    transform (data) {
      data?.events?.forEach(event => {
        if (event.eventImage) {
          event.eventImage.fileHash = "sample-hash"
        }
      })
      return {
        ...data,
        events: data?.events?.map((event) => ({
          ...event,
          image: event.eventImage,
          type: "event",
          tease: event.body[0]?.value || "",
          cmsSource: 'wagtail',
          //slug: event.meta.slug
        })),
      }
    },
    onResponse ({ response }) {

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

    <section class="py-6 thinContent">
      <h2 class="mb-4">Events</h2>
      <div class="col-12 grid grid-nogutter">
        <template v-if="status === 'success'">
          <MediaCard
            v-for="(event, index) in eventData.events"
            :key="`${event.id}-${index}`"
            class="col-12 mb-5"
            :data="event"
            is-horizontal
            showTease
            imgCol="md:w-7rem lg:w-6"
            :size="{ xs: [112, 112], lg: [332, 184] }"
            @on-click="dynamicNavigation(event)"
          />
        </template>
        <skeleton-media-card
          v-else
          v-for="index in 20"
          :key="`skeleton-2-${index}`"
          class="col-12 mb-5"
          is-horizontal
          is-event
          imgCol="w-6"
          :size="{ xs: [112, 112], md: [300, 150] }"
        />
      </div>

      <pre>{{ eventData?.events }}</pre>
    </section>

    <section v-if="getFilteredTopStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>

    <BackToTopButton />
  </div>
</template>
