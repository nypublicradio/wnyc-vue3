<script setup>
import { trackClickEvent, saveRecentlyPlayed } from '~/utilities/helpers'
import { updateLiveStream } from '~/composables/data/liveStream'
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useCurrentStreamStation,
  useAllCurrentStations,
  useIsEpisodePlaying,
  useIsStreamLoading,
} from '~/composables/states'
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
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
        'Click Tracking - Station Button',
        'Live Page',
        `switch station ${currentEpisodeHolder.value.name}`
      )
    }
  }
}
const togglePlay = () => {
  if (currentEpisode.value !== currentEpisodeHolder.value) {
    //update slug
    currentStreamStation.value = currentEpisodeHolder.value.slug
    currentEpisode.value = currentEpisodeHolder.value
    saveRecentlyPlayed(currentEpisode.value, mediaTypes.LIVE)
  }
  trackClickEvent(
    'Click Tracking - Toggle Play Button',
    'Live Page',
    `play pause station ${currentEpisodeHolder.value.name}`
  )
}

const scrollToActiveStation = () => {
  const activeStation = document.getElementsByClassName('activestation')
  if (activeStation[0]) {
    //console.log('scrolling')
    activeStation[0].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'start',
    })
  }
}

const toggleFollow = (episode) => {
  trackClickEvent(
    'Click Tracking - Schedule Follow Button',
    'Live Page',
    `follow ${currentStreamStation.value} - ${episode}`
  )
}

const getTime = (startArg, endArg, index) => {
  const start = new Date(startArg)
  const startTime = start.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })
  const end = new Date(endArg)
  const endTime = end.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
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
      <HorizontalScrollFeature class="live-stations-holder">
        <div class="live-stations flex">
          <div
            v-for="station in allCurrentStations"
            class="station-holder"
            :class="{
              activestation:
                currentEpisodeHolder?.station === station.station ||
                currentEpisode?.station === station.station,
            }"
            :key="station.station"
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
                    <i
                      v-if="isStreamLoading"
                      class="pi pi-spin pi-spinner mr-2"
                    ></i>
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
      <section class="current-station-info flex gap-3">
        <VImage
          v-if="currentEpisodeHolder?.image"
          :src="currentEpisodeHolder?.image"
          :width="100"
          :height="100"
          :ratio="[1, 1]"
          alt="show poster image"
          class="image"
        />
        <div class="info flex gap-3">
          <div class="content flex flex-column gap-1 justify-content-start">
            <LiveBadge class="align-self-start" />
            <h2>{{ currentEpisodeHolder?.title }}</h2>
            <div
              class="blurb truncate t3lines"
              v-html="
                currentEpisodeHolder?.onTodaysShowHeadline ??
                currentEpisodeHolder?.details
              "
            />
          </div>
        </div>
      </section>
      <PlayAndSkipButtons @beforeTogglePlay="togglePlay" />
    </div>
    <section class="schedule" v-if="scheduleRef">
      <h2>Schedule</h2>
      <div
        v-for="(entry, index) in scheduleRef"
        :key="entry.id"
        class="schedule-entry flex justify-content-between align-items-center gap-3 mt-4"
      >
        <div class="flex align-items-stretch">
          <div class="left my-1" :class="[{ selected: index === 0 }]" />
          <div>
            <p class="time">
              {{ getTime(entry.attributes.start, entry.attributes.end, index) }}
            </p>
            <h2 class="title">
              {{
                entry.attributes.scheduleEventTitle ??
                entry.attributes.parentTitle
              }}
            </h2>
          </div>
        </div>
        <Button
          severity="secondary"
          text
          plain
          rounded
          class="flex-none"
          @click="
            toggleFollow(
              entry.attributes.scheduleEventTitle ??
                entry.attributes.parentTitle
            )
          "
        >
          <template #icon>
            <FollowIcon :active="false" />
          </template>
        </Button>
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.live-page {
  .top {
    padding: 1.5rem 0;
    background-color: var(--night-500);
    .horizontal-scroll-feature .scroll {
      padding-left: 0 !important;
    }
    .station-holder {
      :after {
        transition: bottom 0.5s;
        -webkit-transition: bottom 0.5s;
        content: '';
        position: absolute;
        bottom: 0px;
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
        :after {
          bottom: -10px;
        }
      }
      .station-btn {
        &:hover,
        &:focus,
        &:active {
          background: var(--red);
          border: 1px solid transparent;
        }
        margin-left: 1rem;
        &:first-child {
          margin-left: 1.25rem;
        }
      }
    }
    .current-station-info {
      .v-image-publisher.image {
        flex: none;
        width: 100px;
      }
    }
  }
  .schedule {
    .schedule-entry {
      .left {
        border: 2px solid transparent;
        border-radius: 8px;
        margin-right: 1rem;
        //height: 27px;
        &.selected {
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
