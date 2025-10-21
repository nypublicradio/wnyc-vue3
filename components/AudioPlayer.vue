<script setup>
import { RemoteStreamer } from "@nypublicradio/capacitor-remote-streamer"
import { Capacitor } from "@capacitor/core"
import { ref, watch } from "vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"
import PauseIcon from "~/components/icons/PauseIcon.vue"
import Previous10 from "~/components/icons/Previous10.vue"
import Next10 from "~/components/icons/Next10.vue"
import { PLAYER_SKIP_TIME } from "~/composables/globals"
import {
  useCurrentEpisode,
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useIsPlayerMinimized,
  useIsStreamLoading,
  useIsLiveStream,
  useIsPlayerExpanded,
  useCurrentEpisodeDuration,
  useCurrentEpisodeProgress,
  useSkipAheadTrigger,
  useSkipBackTrigger,
  useIsNetworkConnected,
  useDeviceId,
  useCurrentUserProfile,
  useGlobalToast,
} from "~/composables/states"
import {
  trackAudioEvent,
  trackClickEvent,
  getDate,
  hasQueryParams,
} from "~/utilities/helpers"
import useManageScrollPosition from "~/composables/useManageScrollPosition"
import { initMediaSession } from "~/utilities/media-session.js"

const devicePlatform = Capacitor.getPlatform()
const { saveScrollPosition, restoreScrollPosition } = useManageScrollPosition()
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
const currentEpisodeDuration = useCurrentEpisodeDuration()
const currentEpisodeProgress = useCurrentEpisodeProgress()
const isNetworkConnected = useIsNetworkConnected()
const deviceId = useDeviceId()
const currentUser = useCurrentUserProfile()
const globalToast = useGlobalToast()

const showPlayer = ref(false)
const playerRef = ref(null)
const isBuffering = ref(false)

const route = useRoute()

let delay = 250
const isError = ref(null)

// function that returns the image for the episode
const getTitle = computed(() => {
  return currentEpisode?.value?.episodeTitle ?? currentEpisode?.value?.title
})

// function that returns the media type for the episode
const getMediaType = computed(() => {
  // if the hls value is set, then it is a live stream
  return currentEpisode?.value?.hls ? "live" : "on_demand"
})

// function that returns the description of the episode
const getDescription = computed(() => {
  // if the title and the description are the same, return null for description
  return currentEpisode?.value?.showTitle !== getTitle.value
    ? currentEpisode?.value?.showTitle
    : null
})

/*function that updated the global useIsPlayerMinimized */
const updateUseIsPlayerMinimized = (e) => {
  trackClickEvent(
    "Click Tracking - Audio Player minimized",
    "Audio Player",
    `minimized = ${e}`
  )
  isPlayerMinimized.value = e
}

/*
the url that comes down from publisher is in currentEpisode.value
then if we are in the App env, we check if the url has a param(a "?" already)
then we grab the asID and the restriction value (0 default or 1)
then we add the user id to the url (0 if not logged in)
then we detect the device and add it to the url
then we merge it all together and return it to the player as the source for the request
*/

const getConfiguredAudioUrl = computed(() => {
  // we start with HLS, then file, then audio
  // if none of those are set, then we return an empty string
  const url =
    currentEpisode.value?.hls ||
    currentEpisode.value?.file ||
    currentEpisode.value?.audio ||
    ""
  const hasQuery = hasQueryParams(url)
  const adID = deviceId.value?.identifier ?? "0"
  const userID = currentUser?.value?.id ?? "0"
  const thisDevice = devicePlatform
  // update restriction when we have the value from setting panel
  const restriction = "0"
  return `${url}${
    hasQuery ? "&" : "?"
  }listenerid=${adID}&aw_0_1st.lmt=${restriction}&aw_0_1st.userid=${userID}&device=${thisDevice}`
})

//player release utility function
// ios and web just calls stop(), android calls releasePlayer()
const releasePlayer = async () => {
  try {
    await RemoteStreamer.releasePlayer()
  } catch (error) {
    console.warn("Failed to release player:", error)
  }
}

// setVolume
const currentVolume = ref(1)
const isMuted = ref(false)
// function that handles the volume change
const setVolume = (e) => {
  RemoteStreamer.setVolume({ volume: e })
  currentVolume.value = e
}
// function that handles the mute toggle
const muteToggle = () => {
  if (isMuted.value) {
    RemoteStreamer.setVolume({ volume: currentVolume.value })
    isMuted.value = false
  } else {
    RemoteStreamer.setVolume({ volume: 0 })
    isMuted.value = true
  }
}

// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = async (val) => {
  isNewEpisode.value = true
  showPlayer.value = false

  await releasePlayer()

  // Small delay to ensure cleanup completes
  await new Promise((resolve) => setTimeout(resolve, 100))

  currentEpisode.value = val
  isStreamLoading.value = true
  await nextTick()

  await RemoteStreamer.play({
    url: getConfiguredAudioUrl.value,
    enableCommandCenter: true,
    enableCommandCenterSeek: !isLiveStream.value,
  })

  // initializes the media session in ~/utilities/media-session.js
  initMediaSession(currentEpisode.value)
  setTimeout(() => {
    showPlayer.value = true
    delay = 250
  }, delay)
}

// function that handles the skip to time with the plugin
const handleSkipTo = (e) => {
  RemoteStreamer.seekTo({ position: e })
  trackAudioEvent("skip", getMediaType.value, getTitle.value, getDescription.value)
}
//
const handleSeekTo = (e) => {
  // convert the percentage to the time
  const time = (e / 100) * currentEpisodeDuration.value
  RemoteStreamer.seekTo({ position: time })
  trackAudioEvent("seek", getMediaType.value, getTitle.value, getDescription.value)
}

// handle the toggle play button and tracking
const togglePlayHere = async (e) => {
  if (e && !isEpisodePlaying.value) {
    await RemoteStreamer.resume()
    //await enableBackgroundMode()
    isEpisodePlaying.value = true

    if (isNewEpisode.value) {
      trackAudioEvent("play", getMediaType.value, getTitle.value, getDescription.value)
    } else {
      trackAudioEvent("resume", getMediaType.value, getTitle.value, getDescription.value)
    }
    isNewEpisode.value = false
  } else if (!e && isEpisodePlaying.value) {
    // Pausing playback
    await RemoteStreamer.pause()
    //await disableBackgroundMode()
    isEpisodePlaying.value = false
  }
  // Remove the redundant isEpisodePlaying.value = e line
}

//const handleCast = () => {
//console.log("playerRef.value = ", playerRef.value)
//console.log("remoteControl = ", remoteControl)
//playerRef.value.$mediaPlayerRef.requestGoogleCast()
//playerRef.value.castToGoogleCast()
//remoteControl.requestGoogleCast()
//}

// function that handles the expanded player from the persistent player emit
const handleIsExpanded = (e) => {
  if (e) {
    saveScrollPosition()
  } else {
    restoreScrollPosition()
  }
  isPlayerExpanded.value = e
}

// function that handles the error event from the persistent player emit
//I have to check for "e" it fires 2 times... once with the error and once without
const handleError = async (e) => {
  if (e) {
    await releasePlayer()
    globalToast.value = {
      severity: "error",
      summary: "We are having a problem loading the audio. Please try again later.",
      life: 6000,
      closable: true,
    }

    if (isEpisodePlaying.value) {
      playerRef.value.togglePlay()
      isEpisodePlaying.value = false
    }

    trackAudioEvent(
      "audio error",
      isLiveStream.value ? "live" : "on_demand",
      getTitle.value,
      getDescription.value
    )
  }
}

/*function that fires when the episode has ended/completed */
const episodeEnded = async () => {
  if (isPlayerExpanded.value) {
    playerRef.value.toggleExpanded()
    handleIsExpanded(false)
    setTimeout(() => {
      showPlayer.value = false
      currentEpisode.value = null
    }, 500)
  } else {
    showPlayer.value = false
    currentEpisode.value = null
    handleIsExpanded(false)
  }
  await releasePlayer()
  trackAudioEvent("ended", "on_demand", getTitle.value, getDescription.value)
}

// resume the player if the network is connected where they left off
watch(isNetworkConnected, () => {
  const tempEpisode = currentEpisode.value
  const tempTime = currentEpisodeProgress.value
  if (currentEpisode.value && isNetworkConnected.value && isBuffering.value) {
    // the current episode does not resume, so we have to null it out and then set it back
    currentEpisode.value = null
    setTimeout(() => {
      currentEpisode.value = tempEpisode
    }, 500)
    if (!isLiveStream.value) {
      setTimeout(() => {
        RemoteStreamer.seekTo({ position: tempTime })
      }, 1500)
    }
  }
})

//
// watch(isBuffering, (e) => {
//   console.log("watch: isBuffering = ", isBuffering.value, e)
// })

// function that handles the skip ahead toggle trigger
const handleSkipAhead = () => {
  skipAheadTrigger.value = !skipAheadTrigger.value
}
// function that handles the skip back toggle trigger
const handleSkipBack = () => {
  skipBackTrigger.value = !skipBackTrigger.value
}

watch(currentEpisode, (newVal, oldVal) => {
  //console.log("newVal", newVal)
  //console.log("oldVal", oldVal)
  // only switches the episode if the new value is not null and the audio, hls, or file values have changed. so when coming back into focus, the data can be updated in the currentEpisode, like if it was live and the show changed.
  if (
    newVal !== null &&
    (newVal?.audio !== oldVal?.audio ||
      newVal?.hls !== oldVal?.hls ||
      newVal?.file !== oldVal?.file)
  ) {
    switchEpisode(newVal)
  }
})

watch(togglePlayTrigger, () => {
  togglePlayHere(!isEpisodePlaying.value)
})

watch(skipAheadTrigger, () => {
  handleSkipTo(currentEpisodeProgress.value + PLAYER_SKIP_TIME)
})
watch(skipBackTrigger, () => {
  handleSkipTo(currentEpisodeProgress.value - PLAYER_SKIP_TIME)
})

// if the route changes, and the expanded player is expanded, close the expanded player
watch(
  () => route.name,
  () => {
    if (playerRef.value && isPlayerExpanded.value) {
      playerRef.value.toggleExpanded()
    }
  }
)

onMounted(async () => {
  await RemoteStreamer.addListener("error", (err) => {
    isError.value = err
  })
  await RemoteStreamer.addListener("timeUpdate", (data) => {
    currentEpisodeProgress.value = data.currentTime
  })
  await RemoteStreamer.addListener("play", () => {
    isEpisodePlaying.value = true
    isStreamLoading.value = false
    currentEpisodeDuration.value = currentEpisode.value.duration
  })

  await RemoteStreamer.addListener("pause", () => {
    if (isEpisodePlaying.value) {
      isEpisodePlaying.value = false
      trackAudioEvent("pause", getMediaType.value, getTitle.value, getDescription.value)
    }
  })

  await RemoteStreamer.addListener("buffering", (e) => {
    isBuffering.value = e.isBuffering
    // timeout to prevent the loading spinner from flickering
    setTimeout(() => {
      isStreamLoading.value = isBuffering.value
    }, 250)
  })

  await RemoteStreamer.addListener("stop", (e) => {
    isEpisodePlaying.value = false
    isStreamLoading.value = false
    currentEpisodeProgress.value = 0
    // this is work webview detecting the end of the audio
    if (e?.ended) {
      episodeEnded()
      trackAudioEvent("ended", getMediaType.value, getTitle.value, getDescription.value)
    }
  })
  await RemoteStreamer.addListener("ended", (e) => {
    isEpisodePlaying.value = false
    isStreamLoading.value = false
    currentEpisodeProgress.value = 0
    if (e.ended) {
      episodeEnded()
      trackAudioEvent("ended", getMediaType.value, getTitle.value, getDescription.value)
    }
  })
  // await RemoteStreamer.addListener("id3Metadata", (e) => {
  //   console.log("id3Metadata", e)
  // })
})
</script>

<template>
  <div v-if="currentEpisode">
    <transition name="player">
      <player-v-new-persistent-player
        v-show="showPlayer"
        ref="playerRef"
        class="style-mode-dark"
        :can-expand="true"
        :can-expand-with-swipe="true"
        :can-unexpand-with-swipe="true"
        :title="getTitle"
        :station="currentEpisode?.station"
        :description="getDescription"
        :image="currentEpisode?.player_image"
        :platform="devicePlatform"
        @togglePlay="togglePlayHere"
        @is-minimized="updateUseIsPlayerMinimized"
        @is-expanded="handleIsExpanded($event)"
        @skip-ahead="handleSkipAhead"
        @skip-back="handleSkipBack"
        @error="handleError"
        @scrub-timeline-end="handleSeekTo($event)"
        @volume-change="setVolume($event)"
        @volume-toggle-mute="muteToggle"
        can-click-anywhere
        :showVolume="true"
        :isStreamLoading
        :isEpisodePlaying
        :isLiveStream
        :currentEpisodeDuration
        :currentEpisodeProgress
        :volume="currentVolume"
        :isMuted="isMuted"
      >
        <template #expanded-player-title>
          <PipeData v-if="!isLiveStream" class="text-xs md:text-base">
            <template #left>
              {{
                currentEpisode.showTitle ||
                currentEpisode.station ||
                currentEpisode.headers.brand.title
              }}
            </template>
            <template #right>
              {{ getDate(currentEpisode) }}
            </template>
          </PipeData>
          <div class="expanded-title">{{ getTitle }}</div>
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
          <!-- <Button label="Cast" @click="handleCast" /> -->
          <AudioPlayerExpanded @close-panel="playerRef.toggleExpanded()" />
        </template>
      </player-v-new-persistent-player>
    </transition>
  </div>

  <!-- </div> -->
</template>

<style lang="scss">
html.style-mode-dark .persistent-player {
  .expanded-view .header,
  .expanded-view .expanded-footer {
    background-color: var(--persistent-player-header-footer-bg) !important;
  }
}
body {
  &.app {
    .persistent-player:not(.expanded) {
      bottom: calc(var(--bottom-menu-height) + env(safe-area-inset-bottom));
    }
  }
  &.browser {
    .persistent-player {
      bottom: env(safe-area-inset-bottom);
      &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: calc(-1 * env(safe-area-inset-bottom));
        height: env(safe-area-inset-bottom);
        background-color: var(--persistent-player-bg);
      }
    }
  }
}
.persistent-player:not(.expanded) {
  //bottom: calc(var(--bottom-menu-height) + env(safe-area-inset-bottom));

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
    //margin-left: 6px;
  }
  media-play-button {
    margin-right: 6px;
  }

  // because the desc is v-html and injecting a <p> tag that is overwriting the description styles
  .track-info-description * {
    text-decoration: none;
    color: inherit;
    pointer-events: none;
  }
}

.persistent-player {
  .content {
    max-width: $playerMaxWidth;
    margin: auto;
    width: 100%;
  }
  &.expanded {
    bottom: 0;
  }

  .expanded-view {
    .expanded-content-holder {
      .header {
        z-index: 1;
        padding: 1rem;
        background-color: var(--persistent-player-header-footer-bg);
        opacity: var(--persistent-player-header-footer-bg-opacity);
        backdrop-filter: blur(var(--persistent-player-header-footer-bg-blur));
      }
      .header-top {
        padding: 0 1.5rem;
        .show-image {
          // to prevent a jump when the image finally loads and renders
          height: 144px;
          .image {
            width: 144px;
            height: 144px;
          }
        }
        #expandedViewPlayer {
          margin-top: 1rem;
        }
        @include content-formatting();
      }
      .expanded-title {
        font-size: 2rem;
        font-family: var(--font-family-header);
        line-height: 1.25em;
        font-weight: var(--font-weight-600);
        @include media("<md") {
          font-size: 18px;
        }
      }
      .expanded-footer {
        background-color: var(--persistent-player-header-footer-bg);
        &:after {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: -75px;
          height: 75px;

          // background gradient for fade effect
          background: linear-gradient(
            to top,
            var(--persistent-player-header-footer-bg) 0%,
            rgba(255, 255, 255, 0) 100%
          );
        }
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
</style>

<style lang="scss" scoped>
.player-enter-active {
  transition: transform calc(var(--p-transition-duration)) ease-out;
}

.player-leave-active {
  // making it instant for now
  transition: none;
  //transition: transform calc(var(--p-transition-duration) / 2) ease-in;
}

.player-enter-from,
.player-leave-to {
  transform: translateY(var(--persistent-player-height));
}
</style>
