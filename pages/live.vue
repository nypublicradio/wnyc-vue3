<script setup>
import { trackClickEvent, togglePlayEpisode } from "~/utilities/helpers"
import { updateLiveStream } from "~/composables/data/liveStream"
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useCurrentStreamStation,
  useAllCurrentStations,
  useIsEpisodePlaying,
  useIsStreamLoading,
  useGlobalToast,
  useIsApp,
} from "~/composables/states"

import { scheduleLocalNotification, getEntryTitle } from "~/utilities/local-notifications"
const config = useRuntimeConfig()

const allCurrentStations = useAllCurrentStations()

const currentEpisodeHolder = useCurrentEpisodeHolder()
const isLiveStream = useIsLiveStream()
const currentStreamStation = useCurrentStreamStation()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isStreamLoading = useIsStreamLoading()
const isApp = useIsApp()

const globalToast = useGlobalToast()
const scheduleRef = ref(null)

const route = useRoute()
const router = useRouter()
const routeSlug = ref(route.query.slug)

// get the time for the schedule entry
const getTheTime = (startArg, endArg, index) => {
  const start = new Date(startArg)
  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
  const end = new Date(endArg)
  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  })
  return index === 0 ? `Now Until ${endTime}` : startTime
}

// Function to calculate the time difference between now and the target time
function getTimeDifference(targetTime) {
  const now = new Date()
  const target = new Date(targetTime)

  // Convert both dates to UTC
  const nowUtc = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  )
  let targetUtc = Date.UTC(
    target.getUTCFullYear(),
    target.getUTCMonth(),
    target.getUTCDate(),
    target.getUTCHours(),
    target.getUTCMinutes(),
    target.getUTCSeconds()
  )

  // If the target time is in the past, calculate the time until the next occurrence
  if (nowUtc > targetUtc) {
    target.setUTCDate(target.getUTCDate() + 1)
    targetUtc = Date.UTC(
      target.getUTCFullYear(),
      target.getUTCMonth(),
      target.getUTCDate(),
      target.getUTCHours(),
      target.getUTCMinutes(),
      target.getUTCSeconds()
    )
  }

  return targetUtc - nowUtc
}
let timeout = null

// Function to clear all timeouts
const clearAllTimeout = () => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
}

// Fetch the schedule
const fetchSchedule = async () => {
  clearAllTimeout()
  scheduleRef.value = null
  //const localDate = new Date()
  try {
    const schedule = await $fetch(
      `${config.public.BFF_URL}/api/schedule/${currentStreamStation.value}`,
      {
        method: "POST",
        // params: {
        //   localDate: String(localDate),
        // },
      }
    )

    // add the slug to the schedule data to pass to the local notification system
    schedule.forEach((entry) => {
      entry.slug = currentStreamStation.value
    })

    scheduleRef.value = schedule

    // init setTimeouts to refetch the schedule when the current event starts
    if (scheduleRef.value[0]) {
      // delay plus 2 seconds to make sure the event has ended and the next one has started so when the  next fetch happens, we get the updated schedule displayed
      const delay = (await getTimeDifference(scheduleRef.value[0].attributes.end)) + 2000
      timeout = setTimeout(fetchSchedule, delay)
    }
  } catch (error) {
    globalToast.value = {
      severity: "error",
      summary:
        "Sorry. We are having trouble getting the schedule. Please try again later.",
      life: null,
      closable: true,
    }
    clearAllTimeout()
    console.error("error = ", error)
  }
}

// targets the active station and scrolls to it
const scrollToActiveStation = () => {
  const activeStation = document.getElementsByClassName("activestation")
  if (activeStation[0]) {
    //console.log('scrolling')
    activeStation[0].scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "start",
    })
  }
}

// switch the station and track it
const switchStation = async (station, isPLayingCheck = true) => {
  if (!isStreamLoading.value) {
    if (isEpisodePlaying.value && isPLayingCheck) {
      if (station?.slug !== currentStreamStation.value) {
        await updateLiveStream(station.slug)
        togglePlayTrigger.value = !togglePlayTrigger.value
        currentEpisode.value = station
        currentStreamStation.value = station.slug
        isLiveStream.value = true
      }
    } else {
      if (isPLayingCheck) {
        if (station?.slug !== currentStreamStation.value) {
          currentEpisode.value = null
        }
      }
      currentStreamStation.value = station.slug
      currentEpisodeHolder.value = station
    }
    await fetchSchedule()
    scrollToActiveStation()

    trackClickEvent(
      "Click Tracking - Station Button",
      "Live Page",
      `switch station ${station?.station}`
    )
  }
}
// handle the toggle play button and tracking
const togglePlayHere = () => {
  if (currentEpisode.value?.id !== currentEpisodeHolder.value?.id) {
    //update slug
    currentStreamStation.value = currentEpisodeHolder.value.slug
    //currentEpisode.value = currentEpisodeHolder.value
    togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
  } else {
    togglePlayTrigger.value = !togglePlayTrigger.value
  }
}

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

// Function to get the station by slug and play it when all stations are loaded
const getStationBySlugAndPlayIt = async (querySlug) => {
  // If stations aren't loaded, wait for them to load then continue
  if (!allCurrentStations.value) {
    await new Promise((resolve) => {
      // because the watch is in a Promise, it will not be destroyed when the component is unmounted, so we need to unwatch it
      const unwatch = watch(
        allCurrentStations,
        () => {
          resolve()
          unwatch()
        },
        { once: true }
      )
    })
  }

  const targetStation = allCurrentStations.value.find(
    (station) => station.slug === querySlug
  )

  if (targetStation) {
    setTimeout(() => {
      switchStation(targetStation)
      togglePlayHere()
    }, 100)
  }
}

// watcher for triggering a play of the live stream from a route variable
watch(
  () => router.currentRoute.value.query,
  (newQuery) => {
    // checking if the slug is in the query
    if (newQuery.slug) {
      routeSlug.value = newQuery.slug
      getStationBySlugAndPlayIt(newQuery.slug)
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
        <!-- <pre class="text-xs text-color overflow-hidden">{{ currentEpisodeHolder }}</pre> -->
        <LiveItem :data="currentEpisodeHolder" :size="100" />
      </section>
      <PlayAndSkipButtons
        :hideSkip="true"
        :liveOnly="true"
        @beforeTogglePlay="togglePlayHere"
      />
    </div>
    <section class="schedule">
      <h2>Schedule</h2>
      <div v-if="scheduleRef">
        <div
          v-for="(entry, index) in scheduleRef"
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
            class="flex-none no-hover"
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
