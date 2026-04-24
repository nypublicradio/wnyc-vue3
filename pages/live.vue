<script setup>
//import { trackClickEvent } from "~/utilities/helpers"
import useLiveStream, { updateLiveStream } from "~/composables/data/liveStream"
import {
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useAllCurrentStations,
  useIsEpisodePlaying,
  useIsStreamLoading,
} from "~/composables/states"

const {
  getStationBySlugAndPlayIt,
  switchStation,
  scrollToActiveStation,
  fetchSchedule,
  clearAllTimeout,
} = useLiveStream()

const allCurrentStations = useAllCurrentStations()

const currentEpisodeHolder = useCurrentEpisodeHolder()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isStreamLoading = useIsStreamLoading()
const scheduleHolderRef = ref(null)

const route = useRoute()
const router = useRouter()
const routeSlug = ref(route.query.slug)

// updates the stream to the current station when the page loads ONCE with this watcher
watch(
  currentEpisodeHolder,
  async () => {
    await updateLiveStream(currentEpisodeHolder.value.slug, false)
  },
  { once: true }
)
// fetches the schedule currentEpisodeHolder changes
watch(currentEpisodeHolder, async (oldData, newData) => {
  if (newData) {
    await fetchSchedule()
    scrollToActiveStation()
  }
})

// watcher for triggering a play of the live stream from a route variable

watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    // Prevent the watcher from firing when navigating away from the page
    if (router.currentRoute.value.name !== "live") return

    // checking if the slug is in the query
    if (newQuery.slug) {
      routeSlug.value = newQuery.slug
      getStationBySlugAndPlayIt(newQuery.slug, newQuery.autoplay)
    }
    // page scrolling
    if (import.meta.client) {
      if (newQuery.schedule) {
        setTimeout(() => {
          window.scrollTo({
            top: scheduleHolderRef?.value?.offsetTop + 22,
            behavior: "smooth",
          })
        }, 300)
      } else {
        if (window.scrollY !== 0) {
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
      }
    }
  },
  { immediate: true }
)

onMounted(async () => {
  // check if there is a route slug
  if (!routeSlug.value) {
    // If currentEpisodeHolder aren't loaded, wait for them to load then continue
    if (!currentEpisodeHolder.value) {
      await new Promise((resolve) => {
        // because the watch is in a Promise, it will not be destroyed when the component is unmounted, so we need to unwatch it
        const unwatch = watch(
          currentEpisodeHolder,
          () => {
            resolve()
            unwatch()
          },
          { once: true }
        )
      })
    }
    // select station, and don't check if it is playing
    switchStation(currentEpisodeHolder.value, false)
    //await fetchSchedule()
    scrollToActiveStation("instant")
  }

  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Listen Live",
    page_type: "live_tab",
    content_group: "app_tab",
  })
})

onUnmounted(() => {
  clearAllTimeout()
})

useHead({
  title:
    "Listen Live | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "Listen Live | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "Listen Live | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
})
</script>
<template>
  <div class="page live-page">
    <div class="top flex flex-column gap-3 style-mode-dark mb-3">
      <HorizontalScrollFeature :data="allCurrentStations" class="live-stations-holder">
        <template #default>
          <div class="live-stations flex pb-2 md:w-full md:justify-content-center">
            <div
              v-for="(station, index) in allCurrentStations"
              class="station-holder"
              :class="{
                activestation:
                  currentEpisodeHolder?.station === station.station ||
                  currentEpisode?.station === station.station,
              }"
              :key="`${station.station}-${index}`"
            >
              <div class="relative btn-holder">
                <Button
                  class="station-btn text-sm ml-3 max-w-15rem md:px-4"
                  :severity="
                    currentEpisodeHolder?.station === station.station ||
                    currentEpisode?.station === station.station
                      ? 'primary'
                      : 'secondary '
                  "
                  :label="station.station"
                  :aria-label="`${station.station} button`"
                  :aria-disabled="isStreamLoading"
                  @click="switchStation(station)"
                >
                  <template #default>
                    <div class="flex gap-1 align-items-center overflow-hidden w-full">
                      <div
                        v-if="currentEpisode?.station === station.station"
                        class="flex-shrink-0"
                      >
                        <i v-if="isStreamLoading" class="pi pi-spin pi-spinner mr-2"></i>
                        <WnycLoader
                          v-else
                          class="pr-2"
                          :svgYscale="1.25"
                          :svgXscale="0.5"
                          :bars="3"
                          :paused="!isEpisodePlaying"
                          size="16px"
                        />
                      </div>
                      <div
                        class="flex flex-column align-items-start overflow-hidden flex-1 min-w-0"
                      >
                        <span
                          class="station-name font-bold white-space-nowrap text-left"
                          >{{ station.station }}</span
                        >
                        <span
                          class="show-title truncate text-left"
                          style="width: 100%; min-width: 0"
                          >{{ station.showTitle || station.episodeTitle }}</span
                        >
                      </div>
                    </div>
                  </template>
                </Button>
              </div>
            </div>
          </div>
        </template>
        <template #skeleton>
          <div
            class="flex w-full justify-content-start md:justify-content-center pb-2 lg:-ml-4"
          >
            <div v-for="i in 4" class="item" :key="`${i}-skeleton`">
              <Skeleton
                class="hidden md:flex flex-none ml-4"
                height="52.16px"
                width="180px"
                borderRadius="30px"
              />
              <Skeleton
                class="flex md:hidden flex-none ml-4"
                height="33.16px"
                width="120px"
                borderRadius="30px"
              />
            </div>
          </div>
        </template>
      </HorizontalScrollFeature>

      <section class="current-station-info grid grid-nogutter m-auto">
        <div class="col-fixed hidden xl:block xxl:w-15rem xl:w-7rem"></div>
        <div class="col pr-2 lg:pr-4">
          <LiveItem :data="currentEpisodeHolder" />
        </div>
        <div class="col-fixed hidden xl:block xxl:w-15rem xl:w-7rem"></div>
      </section>
    </div>
    <!-- <pre class="overflow-hidden">{{ allCurrentStations }}</pre> -->
    <!-- <pre>{{ liveScheduleData }}</pre> -->
    <!-- <pre>{{ allLiveScheduleData }}</pre> -->
    <!-- <pre>{{ currentEpisode }}</pre> -->
    <!-- <pre class="overflow-hidden">{{ currentEpisodeHolder }}</pre> -->
    <section class="schedule-holder">
      <div class="grid grid-nogutter m-auto">
        <div class="col w-full md:pr-2 lg:pr-4" ref="scheduleHolderRef">
          <Schedule />
        </div>
        <div class="col-fixed hidden xl:block xl:w-19rem justify-content-center">
          <story-htlAd
            layout="rectangle"
            slotClass="htlad-wnyc_livepage_rectangle"
            fineprint="WNYC is funded by sponsors and member donations"
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
html {
  &.style-mode-dark {
    .live-page {
      .top {
        background-color: transparent;
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.live-page {
  .top {
    padding: 2.5rem 0;
    background-color: var(--p-surface-950);
    .station-holder {
      position: relative;
      &:after {
        transition: bottom 0.5s, border-top 0.5s;
        -webkit-transition: bottom 0.5s, border-top 0.5s;
        content: "";
        position: absolute;
        bottom: 2px;
        right: 0;
        left: 1.25rem;
        margin: auto;
        width: 0;
        height: 0;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        border-top: 10px solid var(--p-primary-500);
        z-index: -1;
      }
      &.activestation {
        &:after {
          bottom: -8px;
        }
        &:hover {
          &:after {
            border-top: 10px solid var(--p-primary-600);
          }
        }
      }
      .station-btn {
        .show-title {
          @include media("<md") {
            display: none;
          }
        }
      }
    }
  }
  // .schedule-holder {
  //   background: var(--header-background);
  // }
}
</style>
