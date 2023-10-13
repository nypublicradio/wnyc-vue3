<script setup>
import { ref, watch } from 'vue'
import PlayIcon from '~/components/icons/PlayIcon.vue'
import PauseIcon from '~/components/icons/PauseIcon.vue'
import VPersistentPlayer from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VPersistentPlayer.vue'
import {
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  audioPlayerHeight,
  useIsStreamLoading,
  useCurrentEpisodeDuration,
  useCurrentEpisodeProgress,
  useSkipAheadTrigger,
  useSkipBackTrigger,
} from '~/composables/states'
import {
  trackClickEvent,
  isLiveStream,
  templatizePublisherImageUrl,
} from '~/utilities/helpers'

// had to install howler.js locally and add this import to stop it from breaking the build
// skipcq: JS-0128
import { Howl, Howler } from 'howler'

const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
const isStreamLoading = useIsStreamLoading()
const skipAheadTrigger = useSkipAheadTrigger()
const skipBackTrigger = useSkipBackTrigger()
const currentEpisodeDuration = useCurrentEpisodeDuration()
const currentEpisodeProgress = useCurrentEpisodeProgress()
const showPlayer = ref(false)
const playerRef = ref()
const playerHeight = ref(audioPlayerHeight + 'px')

const route = useRoute()
/*function that updated the global useIsEpisodePlaying */
const updateUseIsEpisodePlaying = (e) => {
  trackClickEvent(
    'Click Tracking - Audio Player play toggle button',
    'Audio Player',
    `playing = ${e}`
  )
  isEpisodePlaying.value = e
}
/*function that updated the global useIsPlayerMinimized */
const updateUseIsPlayerMinimized = (e) => {
  trackClickEvent(
    'Click Tracking - Audio Player minimized',
    'Audio Player',
    `minimized = ${e}`
  )
  isPlayerMinimized.value = e
}

let delay = 0
// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = () => {
  showPlayer.value = false
  currentEpisodeProgress.value = 0
  setTimeout(() => {
    showPlayer.value = true
    delay = 1000
  }, delay)
}

watch(currentEpisode, () => {
  switchEpisode()
})

watch(togglePlayTrigger, () => {
  if (playerRef.value) playerRef.value.togglePlay()
})

watch(skipAheadTrigger, () => {
  if (playerRef.value) playerRef.value.skipAhead()
})
watch(skipBackTrigger, () => {
  if (playerRef.value) playerRef.value.skipBack()
})
let timer = null
let isInitialPing = true
// const pingEvent = () => {
//   const station = currentEpisodeData.value?.name
//     ? currentEpisodeShow.value.name
//     : null
//   const title = currentEpisodeShow.value?.title
//     ? currentEpisodeShow.value.title
//     : null
//   // $analytics.sendEvent('event_tracking', {
//   //   event_category: 'Ping',
//   //   component: 'Audio Player',
//   //   event_label: `${station} - ${title}`,
//   // })
// }
watch(isEpisodePlaying, (e) => {
  if (isInitialPing) {
    //pingEvent()
    isInitialPing = false
  }
  if (e) {
    timer = setInterval(() => {
      //pingEvent()
    }, 60000)
  } else {
    clearInterval(timer)
    timer = null
  }
})

// if the route changes, and the expanded player is expanded, close the expanded player
watch(
  () => route.name,
  (e) => {
    if (playerRef.value && !isPlayerMinimized.value) {
      playerRef.value.toggleExpanded()
    }
  }
)
</script>

<template>
  <!-- <div class="audio-player"> -->

  <transition name="player">
    <VPersistentPlayer
      v-if="showPlayer"
      ref="playerRef"
      data-style-mode="dark"
      :auto-play="true"
      :can-expand="true"
      :can-expand-with-swipe="true"
      :can-unexpand-with-swipe="true"
      :show-download="false"
      :hide-download-mobile="true"
      :show-skip="false"
      :livestream="isLiveStream()"
      :title="currentEpisode.title"
      :title-link="currentEpisode.url"
      :station="currentEpisode.name"
      :description="
        currentEpisode?.onTodaysShowHeadline ?? currentEpisode.details
      "
      :image="templatizePublisherImageUrl(currentEpisode.image)"
      :file="currentEpisode.file"
      :skipAheadTime="10"
      :skipBackTime="10"
      @togglePlay="updateUseIsEpisodePlaying"
      @is-minimized="updateUseIsPlayerMinimized"
      @is-loading="isStreamLoading = $event"
      @duration="currentEpisodeDuration = $event"
      @current-duration="currentEpisodeProgress = $event"
      can-click-anywhere
      marquee
    >
      <template #play>
        <PlayIcon />
      </template>
      <template #pause>
        <PauseIcon />
      </template>
      <template #expanded-content>
        <AudioPlayerExpanded @close-panel="playerRef.toggleExpanded()" />
      </template>
    </VPersistentPlayer>
  </transition>
  <!-- </div> -->
</template>

<style lang="scss">
html.style-mode-dark .persistent-player {
  background-color: map-get($colors-dark-mode, 'background4') !important;

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
  --persistent-player-play-button-height: 38px;
  --persistent-player-play-button-width: 38px;

  .persistent-player {
    bottom: calc(var(--bottom-menu-height) + env(safe-area-inset-bottom));
    .track-info {
      //position: relative;
    }
    .track-info-image {
      width: 60px;
      max-width: 60px;
      height: 60px;
    }
    .track-info .track-info-details .track-info-title .title div {
      font-size: 16px;
      font-style: normal;
      font-family: var(--font-family-header);
      font-weight: 500;
      line-height: 18px;
    }
    .track-info-description {
      font-size: 11px;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track-info-livestream {
      display: none !important;
    }
    .progress-control {
      position: absolute;
      bottom: 0px;
      width: calc(100% - 60px);
      left: 60px;
      height: 2px;
      .p-slider-range {
        background: #000000;
      }
      .p-slider-handle {
        display: none;
      }
      .p-slider {
        //position: initial;
      }
    }
    .track-info-time {
      display: none !important;
    }
    .play-button,
    .p-buttonset > .play-button,
    .p-splitbutton.p-button-secondary > .play-button {
      color: var(--night-500);
      background: #ffffff;
      border: 1px solid var(--background2--500);
    }
    .expanded-view {
      .expanded-content-holder {
        .header {
          z-index: 1;
          padding: 1rem 0.5rem;
          background-color: var(--persistent-player-bg-transparent);
          backdrop-filter: blur(4px);
        }
        .expanded-footer {
          background-color: var(--persistent-player-bg-transparent);
          backdrop-filter: blur(4px);
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
  transition: transform calc(var(--transition-duration) * 2) ease-out;
}

.player-leave-active {
  transition: transform calc(var(--transition-duration) * 2) ease-in;
}

.player-enter-from,
.player-leave-to {
  transform: translateY(v-bind(playerHeight));
}
</style>
