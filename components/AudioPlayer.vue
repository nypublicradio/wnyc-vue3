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
} from '~/composables/states'
import { trackClickEvent, isLiveStream } from '~/utilities/helpers'

// had to install howler.js locally and add this import to stop it from breaking the build
// skipcq: JS-0128
import { Howl, Howler } from 'howler'

const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
const isStreamLoading = useIsStreamLoading()
const currentEpisodeDuration = useCurrentEpisodeDuration()
const currentEpisodeProgress = useCurrentEpisodeProgress()
const showPlayer = ref(false)
const playerRef = ref()
const playerHeight = ref(audioPlayerHeight + 'px')
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
      :show-download="false"
      :hide-download-mobile="true"
      :can-expand-with-swipe="true"
      :show-skip="false"
      :livestream="isLiveStream(currentEpisode.file)"
      :title="currentEpisode.title"
      :title-link="currentEpisode.url"
      :station="currentEpisode.name"
      :description="
        currentEpisode?.onTodaysShowHeadline ?? currentEpisode.details
      "
      :image="currentEpisode.image"
      :file="currentEpisode.file"
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
      <!-- <template #chevronDown>
        <i class="pi pi-twitter"></i>
      </template>
      <template #chevronUp>
        <i class="pi pi-facebook"></i>
      </template>
      <template #volumeOn>
        <i class="pi pi-twitter"></i>
      </template>
      <template #volumeOff>
        <i class="pi pi-facebook"></i>
      </template>
      <template #prev>
        <i class="pi pi-twitter"></i>
      </template>
      
      
      <template #loading>
        <i class="pi pi-spin pi-spinner"></i>
      </template>
      <template #skip>
        <i class="pi pi-twitter"></i>
      </template>
      <template #download>
        <i class="pi pi-twitter"></i>
      </template> -->
      <template #expanded-content>
        <AudioPlayerExpanded />
      </template>
    </VPersistentPlayer>
  </transition>
  <!-- </div> -->
</template>

<style lang="scss">
html.style-mode-dark .persistent-player {
  background-color: map-get($colors-dark-mode, 'background4') !important;
}
:root {
  --persistent-player-padding: 0px 1rem 0 0 !important;
  --persistent-player-height: 60px !important;
  --persistent-player-title-size: 1rem !important;
  --persistent-player-play-button-height: 38px;
  --persistent-player-play-button-width: 38px;

  .persistent-player {
    bottom: calc(var(--bottom-menu-height) + env(safe-area-inset-bottom));
    z-index: 9999;
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
        position: initial;
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
          padding: 1rem 0.5rem;
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
