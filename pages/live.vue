<script setup>
import { trackClickEvent } from '~/utilities/helpers'
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useAllCurrentStations,
  useIsEpisodePlaying,
  useIsStreamLoading,
} from '~/composables/states'
const allCurrentStations = useAllCurrentStations()

const currentEpisodeHolder = useCurrentEpisodeHolder()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isStreamLoading = useIsStreamLoading()

const togglePlay = (station) => {
  if (currentEpisode.value !== station) {
    currentEpisode.value = station
    togglePlayTrigger.value = !togglePlayTrigger.value
    trackClickEvent(
      'Click Tracking - Station Button',
      'Live Page',
      'select station'
    )
  }
}
</script>
<template>
  <div class="live-page">
    <div class="top flex flex-column gap-3">
      <HorizontalScrollFeature class="live-stations-holder">
        <div class="live-stations flex gap-3">
          <div
            v-for="station in allCurrentStations"
            class="station-holder"
            :class="{ active: currentEpisode?.station === station.station }"
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
                      v-else-if="isEpisodePlaying"
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
      <div class="current-station-info">
        <!-- info -->
        <PlayAndSkipButtons v-if="currentEpisode" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.live-page {
  .top {
    padding: 1.5rem 0;
    background-color: var(--night-500);
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
      &.active {
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
      }
    }
  }
}
</style>

<style lang="scss">
// .live-page {
//   .top {
//     .station-btn {
//       .p-button-label {
//         //font-size: 14px;
//       }
//     }
//   }
// }
//
</style>
