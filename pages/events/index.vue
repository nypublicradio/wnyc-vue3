<script setup lang="js">
import { dynamicNavigation } from "~/utilities/helpers"
import { useToast } from "primevue/usetoast"
import { useTopStories } from "~/composables/useTopStories"
import { useIntersectionObserver } from "@vueuse/core"

const { getFilteredTopStories, topStories } = useTopStories()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const toast = useToast()

const offset = ref(0)
const limit = ref(5)
const totalCount = ref(0)
const eventList = ref([])

const pendingMore = ref(false)
const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)

const { data: events, status, error } = useFetch(
  `${config.public.BFF_URL}/api/events/list`,
  {
    //transform: transformEvents,
    onResponse () {

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

watch(events, (newEvents) => {
  if (newEvents) {
    eventList.value = newEvents.events
    if (newEvents.meta) {
      offset.value = newEvents.meta.offset
      limit.value = newEvents.meta.limit
      totalCount.value = newEvents.meta.totalCount
    } else {
      console.warn("Pagination metadata missing in events response")
    }
  }
}, { immediate: true })

const { stop } = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  // so it does not trigger on initial load and before we have data
  if (!isInitialObserver.value && eventList.value) {
    loadMoreRefVisible.value = isIntersecting
  } else {
    isInitialObserver.value = false
  }
})

onUnmounted(() => {
  stop()
})

const loadMore = async () => {
  // Check if we've already loaded all events
  if (eventList.value.length >= totalCount.value || pendingMore.value) return

  const nextOffset = offset.value + limit.value
  pendingMore.value = true
  try {
    const moreEvents = await $fetch(
      `${config.public.BFF_URL}/api/events/list?offset=${nextOffset}&limit=${limit.value}`
    )
    //const moreEvents = transformEvents(moreEventsRaw)
    pendingMore.value = false
    offset.value = nextOffset
    eventList.value = [...eventList.value, ...moreEvents.events]
  } catch (e) {
    pendingMore.value = false
    toast.add({
      severity: "error",
      summary: "We are having a problem loading more events. Please try again later.",
      life: 6000,
      closable: true,
    })
  }
}

watch(loadMoreRefVisible, (val) => {
  if (val) {
    loadMore()
  }
})

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
      <h1 class="mb-4">Events</h1>
      <div class="col-12 grid grid-nogutter">
        <template v-if="status === 'success'">
          <MediaCard
            v-for="(event, index) in eventList"
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
        <WnycLoader
          v-if="eventList.length < totalCount"
          ref="loadMoreRef"
          spinner
          size="40px"
          class="mt-8 flex justify-content-center w-full"
        />
      </div>

      <!-- <pre>{{ eventData?.events }}</pre> -->
    </section>

    <section v-if="getFilteredTopStories" class="thinContent">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>

    <BackToTopButton />
  </div>
</template>
