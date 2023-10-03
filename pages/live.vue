<script setup>
import { trackClickEvent } from '~/utilities/helpers'
import {
  updateAllLiveStreams,
  updateLiveStream,
} from '~/composables/data/liveStream'
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
const route = useRoute()
const router = useRouter()
const allCurrentStations = useAllCurrentStations()

const currentEpisodeHolder = useCurrentEpisodeHolder()
const currentStreamStation = useCurrentStreamStation()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isStreamLoading = useIsStreamLoading()

const togglePlay = async (station) => {
  if (currentEpisode.value !== station) {
    console.log('station = ', station)
    await updateLiveStream(station.slug)
    // update slug

    currentStreamStation.value = currentEpisodeHolder.value.slug
    currentEpisode.value = currentEpisodeHolder.value
    // currentEpisode.value = station
    // currentStreamStation.value = station.slug
    // togglePlayTrigger.value = !togglePlayTrigger.value
    trackClickEvent(
      'Click Tracking - Station Button',
      'Live Page',
      `select station ${currentEpisodeHolder.value.name}`
    )
  }
}

const scrollToActiveStation = () => {
  const activeStation = document.getElementsByClassName('activestation')
  if (activeStation[0]) {
    console.log('scrolling')
    activeStation[0].scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'start',
    })
  }
}

onMounted(() => {
  //await nextTick()
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
                :label="station.station"
                @click="togglePlay(station)"
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
      <PlayAndSkipButtons v-if="currentEpisode" />
    </div>
    <section class="schedule">
      <h2>Schedule</h2>
      <div
        class="schedule-entry flex justify-content-between align-items-center gap-3 mt-4"
      >
        <div class="flex align-items-center">
          <div class="selected" />
          <div>
            <p class="time">12:00 AM</p>
            <h2 class="title">All Things Considered</h2>
          </div>
        </div>
        <FollowIcon :active="false" />
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
        left: 0;
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
      .selected {
        border: 2px solid var(--red);
        border-radius: 8px;
        margin-right: 1rem;
        height: 27px;
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
