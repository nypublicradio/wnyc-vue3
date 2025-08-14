<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import useLiveStream, { updateLiveStream } from "~/composables/data/liveStream"
import {
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useAllCurrentStations,
  useIsEpisodePlaying,
  useIsStreamLoading,
  useIsApp,
} from "~/composables/states"

import { scheduleLocalNotification, getEntryTitle } from "~/utilities/local-notifications"
const {
  getStationBySlugAndPlayIt,
  switchStation,
  scrollToActiveStation,
  fetchSchedule,
  clearAllTimeout,
  getTheTime,
  liveScheduleData,
} = useLiveStream()

const allCurrentStations = useAllCurrentStations()

const currentEpisodeHolder = useCurrentEpisodeHolder()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isStreamLoading = useIsStreamLoading()
const isApp = useIsApp()

const route = useRoute()
const router = useRouter()
const routeSlug = ref(route.query.slug)

// schedule a local notification and track it
const handleScheduleLocalNotification = async (entry) => {
  trackClickEvent(
    "Click Tracking - Schedule Notify Button",
    "Live Page",
    `Notify me about ${entry.station} - ${getEntryTitle(entry)} at ${
      entry.attributes.start
    }`
  )
  entry.station = currentEpisodeHolder.value.station
  await scheduleLocalNotification(entry)
}

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
    // checking if the slug is in the query
    if (newQuery.slug) {
      routeSlug.value = newQuery.slug
      getStationBySlugAndPlayIt(newQuery.slug, newQuery.autoplay)
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
</script>
<template>
  <div class="live-page">
    <Html lang="en">
      <Head>
        <Title
          >Listen Live | WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="Listen Live | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="Listen Live | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
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
              <div class="relative">
                <Button
                  class="station-btn text-sm ml-4 max-w-15rem md:px-4"
                  :severity="
                    currentEpisodeHolder?.station === station.station ||
                    currentEpisode?.station === station.station
                      ? 'primary'
                      : 'contrast'
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
          <div class="flex w-full justify-content-start md:justify-content-center">
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
    <!-- <pre class="text-xs overflow-hidden">{{ allCurrentStations }}</pre> -->
    <!-- <pre>{{ liveScheduleData }}</pre> -->
    <section class="schedule grid m-auto">
      <div class="col pr-2 lg:pr-4">
        <div class="flex flex-wrap justify-content-between align-items-end mb-4">
          <h2 class="text-5xl">Schedule</h2>
          <Button
            severity="secondary"
            variant="link"
            class="link -ml-2"
            @click="handleAllTopics"
            label="Weekly Schedule (pdf)"
          ></Button>
        </div>
        <div v-if="liveScheduleData">
          <div
            v-for="(entry, index) in liveScheduleData"
            :key="`${entry.id}-${index}`"
            class="schedule-entry flex justify-content-between align-items-center gap-3 mt-4"
            :class="[{ selected: index === 0 }]"
          >
            <div class="flex align-items-stretch">
              <div class="left my-1" />
              <div>
                <p class="time">
                  {{ getTheTime(entry.attributes.start, entry.attributes.end, index) }}
                </p>
                <h2 class="title">
                  {{ getEntryTitle(entry) }}
                </h2>
              </div>
            </div>
            <Button
              v-if="isApp && index > 0"
              severity="secondary"
              text
              plain
              rounded
              class="flex-none"
              aria-label="set notification"
              @click="handleScheduleLocalNotification(entry)"
            >
              <template #icon>
                <NotificationIcon :entry="entry" />
              </template>
            </Button>
          </div>
        </div>
        <div v-else class="skeleton mt-5">
          <div
            v-for="i in 10"
            :key="`schedule-skeleton-${i}`"
            class="flex align-items-center justify-content-between pr-2 mb-5"
          >
            <div class="flex gap-3">
              <Skeleton
                height="30px"
                width="4px"
                borderRadius="2px"
                :class="[{ 'opacity-0': i > 0 }]"
              />
              <div class="flex flex-column gap-1">
                <Skeleton
                  class="opacity-50"
                  height="12px"
                  width="64px"
                  borderRadius="4px"
                />
                <Skeleton height="14px" width="174px" borderRadius="4px" />
              </div>
            </div>
            <Skeleton
              :class="[{ 'opacity-0': i < 1 }]"
              height="26px"
              width="26px"
              borderRadius="15px"
            />
          </div>
        </div>
      </div>
      <div class="col-fixed hidden xl:block xl:w-20rem justify-content-center">
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_livepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
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
      .schedule {
        .schedule-entry {
          &.selected {
            background-color: #ffffff1a;
            padding: 0.75rem 0.5rem 0.75rem 0;
            border-radius: 8px;
            .left {
              border: none;
            }
          }
        }
      }
    }
  }
  .live-stations-holder {
    .station-btn {
      .show-title {
        @include media("<md") {
          display: none;
        }
      }
    }
  }
}
</style>
<style lang="scss" scoped>
.live-page {
  .top {
    padding: 1.5rem 0;
    background-color: var(--p-surface-950);
    .station-holder {
      position: relative;
      &:after {
        transition: bottom 0.5s;
        -webkit-transition: bottom 0.5s;
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
      }
      .station-btn {
        &:hover,
        &:focus,
        &:active {
          // nothing looks best
        }
      }
    }
  }
  .schedule {
    .schedule-entry {
      .left {
        border: 2px solid transparent;
        border-radius: 8px;
        margin-right: 1rem;
      }
      &.selected {
        .left {
          border-color: var(--p-primary-500);
        }
      }
      .follow-icon {
        width: 28px;
        height: 28px;
      }
    }
  }
}
</style>
