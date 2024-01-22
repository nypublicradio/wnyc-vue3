<script setup>
import { trackClickEvent, saveRecentlyPlayed } from "~/utilities/helpers"
import { updateLiveStream } from "~/composables/data/liveStream"
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useCurrentStreamStation,
  useAllCurrentStations,
  useIsEpisodePlaying,
  useIsStreamLoading,
} from "~/composables/states"

const config = useRuntimeConfig()

const allCurrentStations = useAllCurrentStations()

const currentEpisodeHolder = useCurrentEpisodeHolder()
const currentStreamStation = useCurrentStreamStation()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isStreamLoading = useIsStreamLoading()

const scheduleRef = ref(null)

const switchStation = async (station) => {
  if (!isStreamLoading.value) {
    if (currentEpisode.value !== station) {
      await updateLiveStream(station.slug)

      //if (isEpisodePlaying.value) {
      togglePlayTrigger.value = !togglePlayTrigger.value
      currentStreamStation.value = station.slug
      currentEpisode.value = station
      currentEpisodeHolder.value = station
      //}

      trackClickEvent(
        "Click Tracking - Station Button",
        "Live Page",
        `switch station ${currentEpisodeHolder.value.name}`
      )
    }
  }
}
// handle the toggle play button and tracking
const togglePlayHere = () => {
  if (currentEpisode.value !== currentEpisodeHolder.value) {
    //update slug
    currentStreamStation.value = currentEpisodeHolder.value.slug
    currentEpisode.value = currentEpisodeHolder.value
    saveRecentlyPlayed(currentEpisode.value, mediaTypes.LIVE)
  }
  trackClickEvent(
    "Click Tracking - Toggle Play Button",
    "Live Page",
    `play pause station ${currentEpisodeHolder.value.name}`
  )
}

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

const toggleFollow = (episode) => {
  trackClickEvent(
    "Click Tracking - Schedule Follow Button",
    "Live Page",
    `follow ${currentStreamStation.value} - ${episode}`
  )
}

const getTime = (startArg, endArg, index) => {
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

onMounted(() => {
  setTimeout(() => {
    scrollToActiveStation()
  }, 200)
})

watch(
  currentEpisodeHolder,
  () => {
    setTimeout(() => {
      scrollToActiveStation()
    }, 200)
  },
  { immediate: true }
)
watch(
  currentStreamStation,
  async () => {
    const { data: schedule } = await useFetch(
      `${config.public.BFF_URL}/api/schedule/${currentStreamStation.value}`
    )
    scheduleRef.value = schedule.value
  },
  { immediate: true }
)
</script>
<template>
  <div class="live-page">
    <div class="top flex flex-column gap-3 style-mode-dark mb-3">
      <HorizontalScrollFeature v-if="currentEpisodeHolder" class="live-stations-holder">
        <div class="live-stations flex">
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
                class="station-btn text-sm white-space-nowrap"
                :severity="
                  currentEpisodeHolder?.station === station.station ||
                  currentEpisode?.station === station.station
                    ? 'primary'
                    : 'secondary'
                "
                :label="station.station"
                :aria-disabled="isStreamLoading"
                @click="switchStation(station)"
              >
                <template #icon>
                  <div v-if="currentEpisode?.station === station.station">
                    <i v-if="isStreamLoading" class="pi pi-spin pi-spinner mr-2"></i>
                    <SoundWave
                      v-else
                      class="mr-2"
                      :class="[{ paused: !isEpisodePlaying }]"
                    />
                  </div>
                </template>
              </Button>
            </div>
          </div>
        </div>
      </HorizontalScrollFeature>
      <div v-else class="flex overflow-hidden mb-3">
        <Skeleton
          class="flex-none"
          height="37px"
          width="127px"
          borderRadius="20px"
          style="margin-left: 1.25rem"
        />
        <Skeleton
          class="flex-none"
          height="37px"
          width="127px"
          borderRadius="20px"
          style="margin-left: 1.25rem"
        />
        <Skeleton
          class="flex-none"
          height="37px"
          width="127px"
          borderRadius="20px"
          style="margin-left: 1.25rem"
        />
        <Skeleton
          class="flex-none"
          height="37px"
          width="127px"
          borderRadius="20px"
          style="margin-left: 1.25rem"
        />
      </div>
      <section class="current-station-info">
        <LiveItem :data="currentEpisodeHolder" :size="100" />
      </section>
      <PlayAndSkipButtons :hideSkip="true" @beforeTogglePlay="togglePlayHere" />
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
                {{ getTime(entry.attributes.start, entry.attributes.end, index) }}
              </p>
              <h2 class="title">
                {{ entry.attributes.scheduleEventTitle ?? entry.attributes.parentTitle }}
              </h2>
            </div>
          </div>
          <Button
            v-if="index > 0"
            severity="secondary"
            text
            plain
            rounded
            class="flex-none"
            @click="
              toggleFollow(
                entry.attributes.scheduleEventTitle ?? entry.attributes.parentTitle
              )
            "
          >
            <template #icon>
              <FollowIcon :active="false" />
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
    background-color: var(--night-500);
    .horizontal-scroll-feature .scroll {
      padding-left: 0 !important;
    }
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
        border-top: 10px solid var(--red);
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
        margin-left: 1rem;
        &:first-child {
          margin-left: 1.25rem;
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
          border-color: var(--red);
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

<style lang="scss">
.live-page {
  .top {
    .horizontal-scroll-feature .scroll {
      padding-left: 0 !important;
    }
  }
}
</style>
