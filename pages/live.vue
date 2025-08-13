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
        <div class="live-stations flex pb-2 w-full">
          <div
            v-for="(station, index) in allCurrentStations"
            class="station-holder item"
            :class="{
              activestation:
                currentEpisodeHolder?.station === station.station ||
                currentEpisode?.station === station.station,
            }"
            :key="`${station.station}-${index}`"
          >
            <div class="relative">
              <Button
                class="station-btn text-sm white-space-nowrap btn"
                :severity="
                  currentEpisodeHolder?.station === station.station ||
                  currentEpisode?.station === station.station
                    ? 'primary'
                    : 'secondary'
                "
                :label="station.station"
                :aria-label="`${station.station} button`"
                :aria-disabled="isStreamLoading"
                @click="switchStation(station)"
              >
                <template #icon>
                  <div v-if="currentEpisode?.station === station.station">
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
                </template>
              </Button>
            </div>
          </div>
        </div>
      </HorizontalScrollFeature>
      <section class="current-station-info">
        <LiveItem :data="currentEpisodeHolder" />
      </section>
    </div>
    <pre>{{ currentEpisodeHolder }}</pre>
    <!-- <pre>{{ liveScheduleData }}</pre> -->
    <section class="schedule">
      <h2>Schedule</h2>
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
        // margin-left: 1rem;
        // &:first-child {
        //   margin-left: 1.25rem;
        // }
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
