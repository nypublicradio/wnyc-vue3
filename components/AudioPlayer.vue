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
  audioPlayerHeight,
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
  templatizePublisherImageUrl,
  getDate,
  hasQueryParams,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"

import { initMediaSession } from "~/utilities/media-session.js"

const devicePlatform = Capacitor.getPlatform()

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
const playerHeight = ref(`${audioPlayerHeight}px`)
const isBuffering = ref(false)

const route = useRoute()

let delay = 250
const isError = ref(null)

const getDescription = computed(() => {
  if (isLiveStream.value) {
    return currentEpisode?.value?.episodeTitle
  } else {
    return currentEpisode?.value?.showTitle
  }
})

const getMediaType = computed(() => {
  // if the hls value is set, then it is a live stream
  return currentEpisode?.value?.hls ? "live" : "on_demand"
})

const getTitle = computed(() => {
  return currentEpisode?.value?.title
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
  const desktop = devicePlatform === "web"
  // if it is not the desktop, then we use the hls value, else we use the file value
  const url = !desktop
    ? currentEpisode.value?.hls ||
      currentEpisode.value?.file ||
      currentEpisode.value?.audio ||
      ""
    : currentEpisode.value?.file || currentEpisode.value?.audio || ""
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

// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = async (val) => {
  isNewEpisode.value = true
  showPlayer.value = false
  await RemoteStreamer.stop()
  currentEpisode.value = val
  isStreamLoading.value = true
  //isLiveStream.value = val.hls ? true : false
  await nextTick()
  await RemoteStreamer.play({
    url: getConfiguredAudioUrl.value,
    enableCommandCenter: true,
    enableCommandCenterSeek: !isLiveStream.value,
  })

  // initiallizes the media session in ~/utilities/media-session.js
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
    isEpisodePlaying.value = true
  }
  if (!e && isEpisodePlaying.value) {
    await RemoteStreamer.pause()
    isEpisodePlaying.value = false
  }
  if (isEpisodePlaying.value && isNewEpisode.value) {
    trackAudioEvent("play", getMediaType.value, getTitle.value, getDescription.value)
  } else if (isEpisodePlaying.value && !isNewEpisode.value) {
    trackAudioEvent("resume", getMediaType.value, getTitle.value, getDescription.value)
  }
  isEpisodePlaying.value = e
  isNewEpisode.value = false
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
  isPlayerExpanded.value = e
}

// function that handles the error event from the persistent player emit
//I have to check for "e" it fires 2 times... once with the error and once without
const handleError = (e) => {
  if (e) {
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
const episodeEnded = () => {
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

// function that handles the skip ahead toggle triiger
const handleSkipAhead = () => {
  skipAheadTrigger.value = !skipAheadTrigger.value
}
// function that handles the skip back toggle trigger
const handleSkipBack = () => {
  skipBackTrigger.value = !skipBackTrigger.value
}

watch(currentEpisode, (val) => {
  if (val !== null) {
    switchEpisode(val)
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
})
</script>

<template>
  <div v-if="currentEpisode">
    <transition name="player">
      <player-v-new-persistent-player
        v-show="showPlayer"
        ref="playerRef"
        data-style-mode="dark"
        :can-expand="true"
        :can-expand-with-swipe="true"
        :can-unexpand-with-swipe="true"
        :title="getTitle"
        :station="currentEpisode?.name"
        :description="getDescription"
        :image="
          templatizePublisherImageUrl(currentEpisode?.image) ?? getEpisodeFallBackImage()
        "
        :platform="devicePlatform"
        @togglePlay="togglePlayHere"
        @is-minimized="updateUseIsPlayerMinimized"
        @is-expanded="handleIsExpanded($event)"
        @skip-ahead="handleSkipAhead"
        @skip-back="handleSkipBack"
        @error="handleError"
        @scrub-timeline-end="handleSeekTo($event)"
        can-click-anywhere
        :isStreamLoading
        :isEpisodePlaying
        :isLiveStream
        :currentEpisodeDuration
        :currentEpisodeProgress
      >
        <template #expanded-player-title>
          <PipeData class="text-xs">
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
      border: 1px solid var(--p-surface-25--500);
    }
  }

  .persistent-player {
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
