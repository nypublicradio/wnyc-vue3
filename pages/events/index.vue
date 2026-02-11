<script setup lang="js">
import { useToast } from "primevue/usetoast"
import { useTopStories } from "~/composables/useTopStories"
import { useIntersectionObserver } from "@vueuse/core"
import { allSocialData } from "~/composables/navigationData.js"

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

const greeneSpaceUrl = "https://thegreenespace.org"
</script>

<template>
  <div class="event-page event-list-page">
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

    <section class="events-section">
      <div class="events-layout">
        <h1 class="events-title">Events</h1>
        <div class="events-list">
          <template v-if="status === 'success'">
            <EventListCard
              v-for="(event, index) in eventList"
              :key="`${event.id}-${index}`"
              :event="event"
            />
          </template>
          <template v-else>
            <Skeleton
              v-for="index in 4"
              :key="`events-skeleton-${index}`"
              class="events-card-skeleton"
              height="203px"
            />
          </template>
          <WnycLoader
            v-if="eventList.length < totalCount"
            ref="loadMoreRef"
            spinner
            size="40px"
            class="events-loader"
          />
        </div>

        <Divider class="events-divider" />

        <aside class="events-rail">
          <h3 class="events-rail__title">Rent The Greene Space</h3>
          <p class="events-rail__copy">
            Host your next event at WNYC and WQXR! The Greene Space will provide you with the same turn-key service for broadcast quality audio and video recording and live streaming that we use to power our own radio stations, podcasts, and concerts.
          </p>
          <VFlexibleLink :to="greeneSpaceUrl" raw class="events-rail__link">
            Learn more
          </VFlexibleLink>
          <SocialButtons class="events-rail__social" :data="allSocialData" />
          <div class="events-rail__ad">
            <story-htlAd
              layout="rectangle"
              slotClass="htlad-wnyc_homepage_rectangle"
              fineprint="WNYC is funded by sponsors and member donations"
            />
          </div>
        </aside>
      </div>
    </section>

    <section v-if="getFilteredTopStories" class="thinContent">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>

    <BackToTopButton />
  </div>
</template>

<style lang="scss" scoped>
.event-list-page {
  .events-section {
    padding-top: 3rem;
    padding-bottom: 3rem;
    padding-left: 32px;
    padding-right: 32px;
  }

  .events-title {
    grid-area: title;
    font-size: 46px;
    line-height: 1.2;
    letter-spacing: -0.02em;
    margin: 0 0 0.5rem;
  }

  .events-layout {
    display: grid;
    grid-template-columns: minmax(0, 672px) minmax(0, 319px);
    column-gap: 32px;
    align-items: start;
    row-gap: 24px;
    justify-content: end;
    grid-template-areas:
      "title ."
      "list rail";
  }

  .events-list {
    grid-area: list;
    display: flex;
    flex-direction: column;
    gap: 35px;
  }

  .events-card-skeleton {
    border-radius: 8px;
  }

  .events-loader {
    margin-top: 2rem;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .events-divider {
    display: none;
    grid-area: divider;
  }

  .events-rail {
    grid-area: rail;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .events-rail__title {
    font-size: 18px;
    font-weight: var(--font-weight-700);
    margin: 0;
  }

  .events-rail__copy {
    margin: 0;
    font-size: 16px;
    line-height: 1.6;
  }

  .events-rail__link {
    color: var(--link-button-color);
    text-decoration: underline;
    font-size: 16px;
    line-height: 1.6;
  }

  .events-rail__social :deep(.social-buttons) {
    gap: 12px;
    flex-wrap: nowrap;
  }

  .events-rail__social :deep(.social-buttons p) {
    font-size: 14px;
    line-height: 20px;
  }

  .events-rail__social :deep(.p-button) {
    width: 24px;
    height: 24px;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--p-text-color);
    box-shadow: none;
  }

  .events-rail__social :deep(.p-button-icon) {
    font-size: 14px;
  }

  .events-rail__ad {
    margin-top: 20px;
    max-width: 300px;
  }

  @include media("<lg") {
    .events-layout {
      grid-template-columns: 1fr;
      grid-template-areas:
        "title"
        "list"
        "divider"
        "rail";
      justify-content: stretch;
    }

    .events-divider {
      display: block;
      margin: 32px 0 20px;
    }

    .events-rail {
      max-width: 340px;
    }
  }

  .thinContent {
    max-width: $contentWidth !important;
    margin: 0 auto;
    padding-left: 32px;
    padding-right: 32px;
    display: grid;
    grid-template-columns: minmax(0, 672px) minmax(0, 319px);
    column-gap: 32px;
    justify-content: end;
  }

  .thinContent > * {
    grid-column: 1;
    min-width: 0;
  }

  @include media("<lg") {
    .thinContent {
      grid-template-columns: 1fr;
      justify-content: stretch;
    }
  }

  @include media("<md") {
    .events-section {
      padding-top: 1.5rem;
      padding-bottom: 2rem;
      padding-left: 20px;
      padding-right: 20px;
    }

    .thinContent {
      padding-left: 20px;
      padding-right: 20px;
    }

    .events-title {
      font-size: 26px;
      margin-bottom: 1rem;
    }

    .events-list {
      gap: 32px;
    }

    .events-rail__copy {
      font-size: 13px;
    }

    .events-rail__title {
      font-size: 16px;
    }
  }
}
</style>
