<script setup>
import { ref, watch } from 'vue'
import PlayIcon from '~/components/icons/PlayIcon.vue'
import PauseIcon from '~/components/icons/PauseIcon.vue'
import VPersistentPlayer from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VPersistentPlayer.vue'
import {
  useCurrentEpisode,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  audioPlayerHeight,
  useIsStreamLoading,
} from '~/composables/states'
import { trackClickEvent } from '~/utilities/helpers'

// had to install howler.js locally and add this import to stop it from breaking the build
// skipcq: JS-0128
import { Howl, Howler } from 'howler'

const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
const isStreamLoading = useIsStreamLoading()
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
      :livestream="true"
      :title="currentEpisode.title"
      :title-link="currentEpisode.url"
      :station="currentEpisode.name"
      :description="currentEpisode.details"
      :image="currentEpisode.image"
      :file="currentEpisode.file"
      @togglePlay="updateUseIsEpisodePlaying"
      @is-minimized="updateUseIsPlayerMinimized"
      @is-loading="isStreamLoading = $event"
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
        <section>
          this is where we would put anything in the expanded view
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          this is where we would put anything in the expanded view
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
          <br />
        </section>
        <section class="expandedFooter">This is fixed to the bottom</section>
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
    bottom: var(--bottom-menu-height);
    z-index: 9999;
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
    .track-info-description p {
      font-size: 11px !important;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .track-info-livestream {
      display: none !important;
    }
    .play-button,
    .p-buttonset > .play-button,
    .p-splitbutton.p-button-secondary > .play-button {
      color: var(--night-500);
      background: #ffffff;
      border: 1px solid var(--background2--500);
    }
  }
  .template-blank {
    .persistent-player {
      bottom: 0;
    }
    .expandedFooter {
      bottom: 0 !important;
    }
  }
}
</style>

<style lang="scss" scoped>
.persistent-player {
  .expandedFooter {
    background-color: var(--red-500);
    display: block;
    position: fixed;
    height: 45px;
    bottom: 0;
    left: 0;
    width: 100%;
    transition: bottom $transitionDuration;
    -webkit-transition: bottom $transitionDuration;
  }
  &.expanded {
    .expandedFooter {
      bottom: $bottomMenuHeight;
    }
  }
}
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
