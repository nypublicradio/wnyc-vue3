<script setup>
import { ref, watch, computed } from 'vue'
import VPersistentPlayer from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VPersistentPlayer.vue'
import {
  useCurrentEpisode,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  audioPlayerHeight,
} from '~/composables/states'
import { trackClickEvent } from '~/utilities/helpers'

// had to install howler.js locally and add this import to stop it from breaking the build
import { Howl, Howler } from 'howler'

const currentEpisode = useCurrentEpisode()
//console.log('currentEpisode', currentEpisode)
const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const isPlayerMinimized = useIsPlayerMinimized()
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
  console.log('currentEpisode = ', currentEpisode.value)
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
//console.log('currentEpisode = ', currentEpisode.value)
</script>

<template>
  <div class="audio-player">
    <transition name="player">
      <v-persistent-player
        data-style-mode="dark"
        ref="playerRef"
        v-if="showPlayer"
        :auto-play="true"
        :livestream="true"
        :title="currentEpisode.title"
        :title-link="currentEpisode.url"
        :station="currentEpisode.name"
        :description="currentEpisode.details"
        :image="currentEpisode.image"
        :file="currentEpisode.file"
        :show-skip="false"
        :can-minimize="true"
        :showTrack="false"
        @togglePlay="updateUseIsEpisodePlaying"
        @is-minimized="updateUseIsPlayerMinimized"
      />
    </transition>
  </div>
</template>

<style lang="scss">
.audio-player {
  bottom: var(--bottom-menu-height);
  width: 100%;
  position: fixed;
  /* display: block; */
  z-index: 9999;
  // slide in from bottom to top
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

  .persistent-player {
    position: absolute;
    .track-info-description p {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
