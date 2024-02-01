<script setup>
import { ref, watch } from "vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"
import PauseIcon from "~/components/icons/PauseIcon.vue"
import Previous10 from "~/components/icons/Previous10.vue"
import Next10 from "~/components/icons/Next10.vue"
import VNewPersistentPlayer from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VNewPersistentPlayer.vue"
import {
  useCurrentEpisode,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  audioPlayerHeight,
  useIsStreamLoading,
  useIsLiveStream,
  useIsPlayerExpanded,
  useCurrentEpisodeDuration,
  useCurrentEpisodeProgress,
  useSkipAheadTrigger,
  useSkipBackTrigger,
  usePlayerSeek,
} from "~/composables/states"
import {
  trackAudioEvent,
  trackClickEvent,
  templatizePublisherImageUrl,
  getDate,
} from "~/utilities/helpers"

import { initMediaSession } from "~/utilities/media-session.js"

// if (process.client) {
//   import("~/utilities/media-session.js").then((module) => {
//     // Use your module here
//     console.log("after load")
//   })
// }

const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isLiveStream = useIsLiveStream()
const isNewEpisode = ref(false)
const isPlayerExpanded = useIsPlayerExpanded()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
const isStreamLoading = useIsStreamLoading()
const skipAheadTrigger = useSkipAheadTrigger()
const skipBackTrigger = useSkipBackTrigger()
const playerSeek = usePlayerSeek()
const currentEpisodeDuration = useCurrentEpisodeDuration()
const currentEpisodeProgress = useCurrentEpisodeProgress()
const showPlayer = ref(false)
const playerRef = ref()
const playerHeight = ref(audioPlayerHeight + "px")
const skipTime = 10

const route = useRoute()

/*function that updated the global useIsEpisodePlaying */
const updateUseIsEpisodePlaying = (e) => {
  isEpisodePlaying.value = e
}

/*function that updated the global useIsPlayerMinimized */
const updateUseIsPlayerMinimized = (e) => {
  trackClickEvent(
    "Click Tracking - Audio Player minimized",
    "Audio Player",
    `minimized = ${e}`
  )
  isPlayerMinimized.value = e
}

/*function that fires when the episode has ended/completed */
const episodeEnded = () => {
  // TO DO
  // trackAudioEvent("ended", "on_demand", getTitle.value, getDescription.value)
}

let delay = 0
// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = () => {
  isNewEpisode.value = true
  showPlayer.value = false
  setTimeout(() => {
    showPlayer.value = true
    // initializes the media session in ~/utilities/media-session.js
    initMediaSession(currentEpisode.value, skipTime)
    delay = 250
  }, delay)
}

watch(currentEpisode, () => {
  // console.log("currentEpisode.value changed = ", currentEpisode.value)
  switchEpisode()
})

watch( togglePlayTrigger, () => {
  if ( playerRef.value ) playerRef.value.togglePlay()
})

watch(skipAheadTrigger, () => {
  if (playerRef.value) playerRef.value.skipAhead()
})
watch(skipBackTrigger, () => {
  if (playerRef.value) playerRef.value.skipBack()
})
watch(
  playerSeek,
  (e) => {
    if (playerRef.value) {
      playerRef.value.scrubTimelineEnd(e.time)
    }
  },
  { deep: true }
)

// if the route changes, and the expanded player is expanded, close the expanded player
watch(
  () => route.name,
  () => {
    if (playerRef.value && !isPlayerMinimized.value) {
      playerRef.value.toggleExpanded()
    }
  }
)

const getTitle = computed(() => {
  return currentEpisode?.value?.title
} )

const getDescription = computed(() => {
  if (!isStreamLoading.value) {
    if (isLiveStream.value) {
      return currentEpisode?.value?.episodeTitle
    } else {
      return currentEpisode?.value?.showTitle
      //currentEpisode?.onTodaysShowHeadline ?? currentEpisode?.details
    }
  } else {
    return "..."
  }
} )

// handle the toggle play button and tracking
const togglePlayHere = ( e ) => {
  // prevent the player from toggling twice
  if (isEpisodePlaying.value === e) return
  updateUseIsEpisodePlaying( e )
  let eventType = isEpisodePlaying.value ? "resume" : "pause"
  if (isNewEpisode.value) {
    eventType = "play"
  }
  trackAudioEvent( eventType, isLiveStream.value ? "live" : "on_demand", getTitle.value, getDescription.value )
  isNewEpisode.value = false
}
</script>

<template>
  <!-- <div class="audio-player"> -->
  <!-- <Button
    :label="playerSeek.time"
    @click="playerSeek.bool = playerSeek.bool ? false : true"
    class="absolute"
    style="top: 200px; z-index: 672397862938679"
  /> -->

  <div v-if="currentEpisode">
    <transition name="player">
      <VNewPersistentPlayer
        v-show="showPlayer"
        ref="playerRef"
        data-style-mode="dark"
        :auto-play="true"
        :can-expand="true"
        :can-expand-with-swipe="true"
        :can-unexpand-with-swipe="true"
        :show-download="false"
        :show-volume="false"
        :hide-download-mobile="true"
        :show-skip="isPlayerExpanded"
        :title="getTitle"
        :station="currentEpisode?.name"
        :description="getDescription"
        :image="templatizePublisherImageUrl(currentEpisode?.image)"
        :file="currentEpisode?.hls ?? currentEpisode?.file"
        :skipAheadTime="skipTime"
        :skipBackTime="skipTime"
        :nativeHLS="true"
        @togglePlay="togglePlayHere"
        @is-minimized="updateUseIsPlayerMinimized"
        @is-loading="isStreamLoading = $event"
        @is-live="isLiveStream = $event"
        @is-expanded="isPlayerExpanded = $event"
        @duration="currentEpisodeDuration = $event"
        @current-duration="currentEpisodeProgress = $event"
        @ended="episodeEnded"
        can-click-anywhere
        :marquee="false"
        streamType="unknown"
      >
        <template #expanded-player-title>
          <PipeData class="text-xs">
            <template #left>
              <span>
                <p class="text-xs">
                  {{ currentEpisode.showTitle ?? currentEpisode.station }}
                </p>
              </span>
            </template>
            <template #right>
              <div class="flex gap-2 align-items-center">
                <p class="text-xs">
                  {{
                    getDate(currentEpisode.updatedDate ?? currentEpisode.publicationDate)
                  }}
                </p>
              </div>
            </template>
          </PipeData>
          <div class="expanded-title">{{ currentEpisode.title }}</div>
        </template>
        <template #skipBack>
          <Previous10 />
        </template>
        <template #play>
          <PlayIcon />
        </template>
        <template #pause>
          <PauseIcon />
        </template>
        <template #skipAhead>
          <Next10 />
        </template>
        <template #expanded-content>
          <AudioPlayerExpanded @close-panel="playerRef.toggleExpanded()" />
        </template>
      </VNewPersistentPlayer>
    </transition>
  </div>

  <!-- </div> -->
</template>

<style lang="scss">
html.style-mode-dark .persistent-player {
  background-color: map-get($colors-dark-mode, "background4") !important;

  .expanded-view .header,
  .expanded-view .expanded-footer {
    background-color: var(--expandedHeaderBackgroundTransparent) !important;
    backdrop-filter: blur(4px);
  }
}
:root {
  --persistent-player-padding: 0px 1rem 0 0 !important;
  --persistent-player-height: 60px !important;
  --persistent-player-title-size: 1rem !important;
  --persistent-player-title-weight: 500;
  --persistent-player-desc-size: 11px;
  --persistent-player-play-button-height: 38px;
  --persistent-player-play-button-width: 38px;

  .persistent-player:not(.expanded) {
    bottom: calc(var(--bottom-menu-height) + env(safe-area-inset-bottom));

    // no live icon
    .track-info-livestream {
      display: none !important;
    }
    // no time
    .media-time,
    .media-time-divider {
      display: none !important;
    }

    // no seek buttons
    media-seek-button {
      display: none !important;
    }

    .track-info {
      margin-left: 6px;
    }
    media-play-button {
      margin-right: 6px;
    }
    .track-info-image {
      width: 60px;
      max-width: 60px;
      height: 60px;
    }
    .track-info .track-info-details .track-info-title .title div {
      font-family: var(--font-family-header);
      line-height: 18px;
    }
    // because the desc is v-html and injecting a <p> tag that is overwriting the description styles
    .track-info-description * {
      text-decoration: none;
      color: inherit;
      pointer-events: none;
    }
    .play-button,
    .p-buttonset > .play-button,
    .p-splitbutton.p-button-secondary > .play-button {
      color: var(--night-500);
      background: #ffffff;
      border: 1px solid var(--background2--500);
    }
  }

  .persistent-player {
    .play-icon {
      .play-icon {
        width: 17px;
        height: 17px;
        margin-top: 5px;
        margin-left: 2px;
      }
    }
    &.expanded {
      bottom: 0;
    }

    .expanded-view {
      .expanded-content-holder {
        .header {
          z-index: 1;
          padding: 1rem;
          background-color: var(--persistent-player-bg-transparent);
          backdrop-filter: blur(4px);
        }
        .header-top {
          padding: 0 1.5rem;
          #expandedViewPlayer {
            margin-top: 1rem;
          }
        }
        .expanded-title {
          font-size: 18px;
          font-family: var(--font-family-header);
          line-height: 26.78px;
          font-weight: 600;
        }
        .expanded-footer {
          background-color: var(--persistent-player-bg-transparent);
          backdrop-filter: blur(4px);
        }
      }
      #expandedControls {
        min-height: 85px;
        .next-10-icon,
        .previous-10-icon {
          width: 20px;
          height: 20px;
        }
      }
    }
  }

  .template-blank {
    .persistent-player {
      bottom: env(safe-area-inset-bottom);
    }
  }
}
</style>

<style lang="scss" scoped>
.player-enter-active {
  transition: transform calc(var(--transition-duration)) ease-out;
}

.player-leave-active {
  // making it instant for now
  transition: none;
  //transition: transform calc(var(--transition-duration) / 2) ease-in;
}

.player-enter-from,
.player-leave-to {
  transform: translateY(v-bind(playerHeight));
}
</style>
