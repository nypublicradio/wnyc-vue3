<script setup>
import { ref, watch } from "vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"
import PauseIcon from "~/components/icons/PauseIcon.vue"
import Previous10 from "~/components/icons/Previous10.vue"
import Next10 from "~/components/icons/Next10.vue"
//import VPersistentPlayer from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VPersistentPlayer.vue"
//import VNewPersistentPlayer from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VNewPersistentPlayer.vue"
import {
  useCurrentEpisode,
  useCurrentEpisodeHolder,
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
import { trackClickEvent, templatizePublisherImageUrl } from "~/utilities/helpers"

// had to install howler.js locally and add this import to stop it from breaking the build
// skipcq: JS-0128
import { Howl, Howler } from "howler"

const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isEpisodePlaying = useIsEpisodePlaying()
const isLiveStream = useIsLiveStream()
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

const route = useRoute()
/*function that updated the global useIsEpisodePlaying */
const updateUseIsEpisodePlaying = (e) => {
  trackClickEvent(
    "Click Tracking - Audio Player play toggle button",
    "Audio Player",
    `playing = ${e}`
  )
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

let delay = 0
// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = () => {
  //showPlayer.value = false
  setTimeout(() => {
    showPlayer.value = true
    delay = 250
  }, delay)
}

watch(
  currentEpisode,
  () => {
    console.log("currentEpisode.value changed = ", currentEpisode.value)
    switchEpisode()
  },
  {
    deep: true,
  }
)

watch(togglePlayTrigger, () => {
  if (playerRef.value) playerRef.value.togglePlay()
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
  (e) => {
    if (playerRef.value && !isPlayerMinimized.value) {
      playerRef.value.toggleExpanded()
    }
  }
)
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
        :hide-download-mobile="true"
        :show-skip="isPlayerExpanded"
        :title="currentEpisode?.title"
        :title-link="currentEpisode?.url"
        :station="currentEpisode?.name"
        :description="currentEpisode?.onTodaysShowHeadline ?? currentEpisode?.details"
        :image="templatizePublisherImageUrl(currentEpisode?.image)"
        :file="currentEpisode?.file"
        :skipAheadTime="10"
        :skipBackTime="10"
        @togglePlay="updateUseIsEpisodePlaying"
        @is-minimized="updateUseIsPlayerMinimized"
        @is-loading="isStreamLoading = $event"
        @is-live="isLiveStream = $event"
        @is-expanded="isPlayerExpanded = $event"
        @duration="currentEpisodeDuration = $event"
        @current-duration="currentEpisodeProgress = $event"
        can-click-anywhere
        marquee
      >
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
  --persistent-player-play-button-height: 38px;
  --persistent-player-play-button-width: 38px;

  .persistent-player {
    bottom: calc(var(--bottom-menu-height) + env(safe-area-inset-bottom));

    &.expanded {
      bottom: 0;
    }
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
  .expanded-view {
    #expandedControls {
      .play-icon {
        width: 13px;
        height: 17px;
        margin-left: 1px;
      }
      .next-10-icon,
      .previous-10-icon {
        width: 20px;
        height: 20px;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.player-enter-active {
  transition: transform calc(var(--transition-duration)) ease-out;
}

.player-leave-active {
  transition: transform calc(var(--transition-duration) / 20) ease-in;
}

.player-enter-from,
.player-leave-to {
  transform: translateY(v-bind(playerHeight));
}
</style>
