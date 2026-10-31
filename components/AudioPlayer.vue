<script setup>
import { RemoteStreamer } from "@nypublicradio/capacitor-remote-streamer"
import { WnycAuto } from "@nypublicradio/wnyc-auto"
import { Capacitor } from "@capacitor/core"
import { ref, watch, nextTick, onBeforeUnmount } from "vue"
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
  usePlaylistQueueState,
} from "~/composables/states"
import {
  trackAudioEvent,
  trackClickEvent,
  getDate,
  hasQueryParams,
} from "~/utilities/helpers"
import useManageScrollPosition from "~/composables/useManageScrollPosition"
import { initMediaSession } from "~/utilities/media-session.js"
import {
  getStreamUrl,
  isKnownDuration,
  buildAutoPlayEpisode,
} from "~/utilities/player"
import { useContinuousPlay } from "~/composables/useContinuousPlay"
import { usePlaylistQueue } from "~/composables/usePlaylistQueue"
const { playNextAfterEnd, playLiveStreamAfterEnd, bumperEnded, cancelBumper } =
  useContinuousPlay()
// keep the playlist queue in sync with whatever is playing
const {
  initPlaylistQueueWatcher,
  initMediaSessionPlaylistControls,
  hasNext,
  hasPrevious,
  playNextInPlaylist,
  playPreviousInPlaylist,
} = usePlaylistQueue()
initPlaylistQueueWatcher()
// browser media controls next/previous track buttons watcher init
initMediaSessionPlaylistControls()
// Initialize device platform on client-side only to avoid SSR errors
const devicePlatform = ref("web")
if (process.client) {
  devicePlatform.value = Capacitor.getPlatform()
}
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
const playlistQueueState = usePlaylistQueueState()

const showPlayer = ref(false)
const playerRef = ref(null)
const isBuffering = ref(false)
const playbackFromAuto = ref(false)
// continuous play is starting the next item because the last one ended
const advancingAfterEnd = ref(false)

const route = useRoute()

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

const getEpisodeContextLabel = computed(() => {
  return (
    currentEpisode.value?.showTitle ||
    currentEpisode.value?.station ||
    currentEpisode.value?.headers?.brand?.title ||
    currentEpisode.value?.show ||
    ""
  )
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
the url that comes down from publisher is in the episode
then if we are in the App env, we check if the url has a param(a "?" already)
then we grab the asID and the restriction value (0 default or 1)
then we add the user id to the url (0 if not logged in)
then we detect the device and add it to the url
then we merge it all together and return it to the player as the source for the request
*/

const getConfiguredAudioUrl = (episode) => {
  // we start with HLS, then file, then audio
  // if none of those are set, then we return an empty string
  const url = getStreamUrl(episode)
  const hasQuery = hasQueryParams(url)
  const adID = deviceId.value?.identifier ?? "0"
  const userID = currentUser?.value?.id ?? "0"
  const thisDevice = devicePlatform.value
  // update restriction when we have the value from setting panel
  const restriction = "0"
  return `${url}${
    hasQuery ? "&" : "?"
  }listenerid=${adID}&aw_0_1st.lmt=${restriction}&aw_0_1st.userid=${userID}&device=${thisDevice}`
}

// CarPlay / Android Auto add the same parameters natively (wnyc-auto), but can't
// see who is signed in, so share it. It's saved on the device for car cold starts.
if (Capacitor.isNativePlatform()) {
  watch(
    () => currentUser?.value?.id ?? null,
    (userId) => {
      WnycAuto.setListenerContext({ userId: userId ? String(userId) : null }).catch((e) =>
        console.warn("Failed to share listener context with the car experience:", e)
      )
    },
    { immediate: true }
  )
}

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

// every switch gets a token, so a switch that a newer one overtook (e.g. a double tap on next) stops at its next await
let switchToken = 0
// the token of the last switch whose item started playing (or failed to), errors before that are from the previous item
let startedSwitchToken = 0

// shows the player paused after the audio failed, so the user can try again
const playbackFailed = () => {
  isStreamLoading.value = false
  isEpisodePlaying.value = false
  trackAudioEvent(
    "audio error",
    isLiveStream.value ? "live" : "on_demand",
    getTitle.value,
    getDescription.value
  )
}

// function that handles the logic for the persistent player to show and hide when the user changes the episode
const switchEpisode = async (val) => {
  const token = ++switchToken
  isNewEpisode.value = true

  // Skip native teardown/play if Auto/CarPlay already started playback
  const fromAuto = playbackFromAuto.value
  playbackFromAuto.value = false
  // After an item ended there is nothing to tear down, and the app may be in the
  // background, where it only runs briefly and timers are throttled: play right away
  const afterEnd = advancingAfterEnd.value
  advancingAfterEnd.value = false
  // anything starting replaces the live stream bumper
  cancelBumper()

  // the player stays open while continuous play moves on
  if (!afterEnd) showPlayer.value = false

  if (!fromAuto && !afterEnd) {
    await releasePlayer()
    // Small delay to ensure cleanup completes
    await new Promise((resolve) => setTimeout(resolve, 100))
    if (token !== switchToken) return
  }

  isStreamLoading.value = !fromAuto // already playing if from Auto

  // Set initial duration from metadata as fallback — "ready" event will overwrite with accurate value
  currentEpisodeDuration.value = val?.duration || 0

  await nextTick()
  if (token !== switchToken) return

  if (!fromAuto) {
    try {
      await RemoteStreamer.play({
        url: getConfiguredAudioUrl(val),
        enableCommandCenter: true,
        enableCommandCenterSeek: !isLiveStream.value,
      })
    } catch (error) {
      // e.g. the browser blocked autoplay, or the url can't be played
      if (token !== switchToken) return
      console.warn("Failed to play:", error)
      startedSwitchToken = token
      playbackFailed()
      showPlayer.value = true
      return
    }
    if (token !== switchToken) return
    // Skip media session update when Auto initiated — it already has correct metadata
    initMediaSession(currentEpisode.value)
  }
  startedSwitchToken = token

  if (afterEnd) {
    showPlayer.value = true
  } else {
    setTimeout(() => {
      // unless a newer switch hid it again
      if (token === switchToken) showPlayer.value = true
    }, 250)
  }
}

// function that handles the skip to time with the plugin
const handleSkipTo = (e) => {
  RemoteStreamer.seekTo({ position: e })
  trackAudioEvent(
    "skip",
    getMediaType.value,
    getTitle.value,
    getDescription.value
  )
}
//
const handleSeekTo = (e) => {
  // convert the percentage to the time
  const time = (e / 100) * currentEpisodeDuration.value
  RemoteStreamer.seekTo({ position: time })
  trackAudioEvent(
    "seek",
    getMediaType.value,
    getTitle.value,
    getDescription.value
  )
}

// handle the toggle play button and tracking
const togglePlayHere = async (e) => {
  if (e && !isEpisodePlaying.value) {
    await RemoteStreamer.resume()
    isEpisodePlaying.value = true

    if (!isNewEpisode.value) {
      trackAudioEvent(
        "resume",
        getMediaType.value,
        getTitle.value,
        getDescription.value
      )
    }
    isNewEpisode.value = false
  } else if (!e && isEpisodePlaying.value) {
    // Pausing playback
    await RemoteStreamer.pause()
    isEpisodePlaying.value = false
  }
  // Remove the redundant isEpisodePlaying.value = e line
}

// function that handles the expanded player from the persistent player emit
const handleIsExpanded = (e) => {
  if (e) {
    saveScrollPosition()
  } else {
    restoreScrollPosition()
  }
  isPlayerExpanded.value = e
}

// function that handles the error event from the player
const handleError = async (e) => {
  // errors while switching items are from the previous item, until the new one has started
  if (!e || startedSwitchToken !== switchToken) return

  await releasePlayer()
  playbackFailed()
}

// runs a continuous play step after an item ended: what it loads plays right away (see switchEpisode)
// returns what the step returns
const continueAfterEnd = async (step) => {
  const endedEpisode = currentEpisode.value
  advancingAfterEnd.value = true
  const result = await step()
  // nothing new was loaded (e.g. the bumper is playing), so no switch will take the flag
  if (currentEpisode.value === endedEpisode) advancingAfterEnd.value = false
  return result
}

/*function that fires when the episode has ended/completed */
const episodeEnded = async () => {
  // the live stream bumper (continuous play) ended: on to the live stream
  if (await continueAfterEnd(bumperEnded)) return

  // before anything changes the current episode
  trackAudioEvent("ended", getMediaType.value, getTitle.value, getDescription.value)

  // continuous play: straight on to the next item in the playlist queue, keeping the player open
  if (await continueAfterEnd(playNextAfterEnd)) return

  const endedEpisode = currentEpisode.value
  if (isPlayerExpanded.value) {
    playerRef.value.toggleExpanded()
    handleIsExpanded(false)
    setTimeout(() => {
      showPlayer.value = false
      // unless something else (e.g. the live stream) has started meanwhile
      if (currentEpisode.value === endedEpisode) currentEpisode.value = null
    }, 500)
  } else {
    showPlayer.value = false
    currentEpisode.value = null
    handleIsExpanded(false)
  }
  await releasePlayer()

  // if the user has continuous play enabled, then we want to play the live stream after the episode has ended
  continueAfterEnd(playLiveStreamAfterEnd)
}

// resume the player if the network is connected where they left off
// web only: the native players reconnect by themselves when the network comes back
if (!Capacitor.isNativePlatform()) {
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
}

// function that handles the skip ahead toggle trigger
const handleSkipAhead = () => {
  skipAheadTrigger.value = !skipAheadTrigger.value
}
// function that handles the skip back toggle trigger
const handleSkipBack = () => {
  skipBackTrigger.value = !skipBackTrigger.value
}

// handlePreviousInPlaylist
const handlePreviousInPlaylist = () => {
  // logic to handle previous in playlist
  if (hasPrevious.value) {
    playPreviousInPlaylist()
  }
}

// handleNextInPlaylist
const handleNextInPlaylist = () => {
  // logic to handle next in playlist
  if (hasNext.value) {
    playNextInPlaylist()
  }
}

watch(currentEpisode, (newVal, oldVal) => {
  // only switches the episode if the new value is not null and the audio, hls, or file values have changed. so when coming back into focus, the data can be updated in the currentEpisode, like if it was live and the show changed.
  if (
    newVal !== null &&
    (newVal?.audio !== oldVal?.audio ||
      newVal?.hls !== oldVal?.hls ||
      newVal?.file !== oldVal?.file)
  ) {
    switchEpisode(newVal)
  } else {
    // the flags are only for the switch they were set for
    playbackFromAuto.value = false
    advancingAfterEnd.value = false
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

// if the global isPlayerMinimized state changes, sync it to the player component
watch(isPlayerMinimized, (val) => {
  if (playerRef.value) {
    playerRef.value.toggleMinimize(val)
  }
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

// the player listeners, removed when the player unmounts: it remounts after the error page and on HMR,
// and listeners left behind would handle every event twice
let listenerHandles = []
let isUnmounted = false
const addPlayerListener = async (eventName, listener) => {
  const handle = await RemoteStreamer.addListener(eventName, listener)
  // unmounted while the listener was being added
  if (isUnmounted) {
    handle.remove()
  } else {
    listenerHandles.push(handle)
  }
}

onBeforeUnmount(() => {
  isUnmounted = true
  listenerHandles.forEach((handle) => handle.remove())
  listenerHandles = []
})

onMounted(async () => {
  await addPlayerListener("error", (err) => {
    handleError(err)
  })
  await addPlayerListener("timeUpdate", (data) => {
    currentEpisodeProgress.value = data.currentTime
  })
  await addPlayerListener("ready", (data) => {
    // only a real duration: Android sends 0 while it doesn't know it (and sends ready again after seeks), web sends Infinity for a live stream
    if (isKnownDuration(data?.duration)) {
      currentEpisodeDuration.value = data.duration
      // no episode while the live stream bumper plays
      if (currentEpisode.value) currentEpisode.value.duration = data.duration
    }
    isStreamLoading.value = false
  })
  await addPlayerListener("play", () => {
    isEpisodePlaying.value = true

    if (isNewEpisode.value) {
      trackAudioEvent(
        "play",
        getMediaType.value,
        getTitle.value,
        getDescription.value
      )
      isNewEpisode.value = false
    }
  })

  await addPlayerListener("pause", () => {
    if (isEpisodePlaying.value) {
      isEpisodePlaying.value = false
      trackAudioEvent(
        "pause",
        getMediaType.value,
        getTitle.value,
        getDescription.value
      )
    }
  })

  await addPlayerListener("buffering", (e) => {
    // older iOS builds send no payload, so there is nothing to go on
    if (typeof e?.isBuffering !== "boolean") return
    isBuffering.value = e.isBuffering
    // timeout to prevent the loading spinner from flickering
    setTimeout(() => {
      isStreamLoading.value = isBuffering.value
    }, 250)
  })

  await addPlayerListener("stop", (e) => {
    isEpisodePlaying.value = false
    isStreamLoading.value = false
    currentEpisodeProgress.value = 0
    // the end of an item on Android and web (episodeEnded tracks it)
    if (e?.ended) {
      episodeEnded()
    }
  })
  // the end of an item on iOS (episodeEnded tracks it)
  await addPlayerListener("ended", (e) => {
    isEpisodePlaying.value = false
    isStreamLoading.value = false
    currentEpisodeProgress.value = 0
    if (e?.ended) {
      episodeEnded()
    }
  })

  // Auto/CarPlay initiated playback — load the content in the app player
  const handleAutoPlayEvent = (data) => {
    isLiveStream.value = Boolean(data.isLive)

    // Build a minimal episode object from the metadata
    const episode = buildAutoPlayEpisode(data)

    // the car sent the item that is already loaded: nothing to switch, only a car-started item takes the new metadata
    if (
      currentEpisode.value &&
      getStreamUrl(currentEpisode.value) === getStreamUrl(episode)
    ) {
      if (currentEpisode.value.fromAuto) {
        const { title, showTitle, station, player_image, image } = episode
        currentEpisode.value = {
          ...currentEpisode.value,
          title,
          showTitle,
          station,
          player_image,
          image,
        }
      }
      return
    }

    // Set the flag so switchEpisode skips the native play call
    playbackFromAuto.value = true
    currentEpisode.value = episode
    // Update global duration immediately — the "play" event won't fire again
    // if playback is already in progress (e.g. app opened after CarPlay started)
    if (episode.duration > 0) {
      currentEpisodeDuration.value = episode.duration
    }
  }

  // Playback started natively (CarPlay, Android Auto, Assistant): same event on both platforms
  await addPlayerListener("playFromMediaId", handleAutoPlayEvent)

  // Sync with Auto/CarPlay if playback is already in progress when app opens
  if (Capacitor.isNativePlatform()) {
    try {
      const state = await RemoteStreamer.getCurrentState()
      if (isUnmounted) return
      if (state.currentMediaId && !currentEpisode.value) {
        handleAutoPlayEvent({
          mediaId: state.currentMediaId,
          isLive: state.isLiveStream,
          streamUrl: state.streamUrl || state.currentUrl,
          title: state.title,
          artist: state.artist,
          imageUrl: state.imageUrl,
          duration: state.duration,
        })
        // Match the play/pause state from Auto
        isEpisodePlaying.value = Boolean(state.isPlaying)
      }
    } catch (e) {
      console.warn("Failed to get current playback state:", e)
    }
  }
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
        @play-previous-in-playlist="handlePreviousInPlaylist"
        @play-next-in-playlist="handleNextInPlaylist"
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
          <PipeData
            v-if="!isLiveStream"
            class="text-xs md:text-base"
            :hidePipe="Boolean(currentEpisode?.fromAuto)"
          >
            <template #left>
              {{ getEpisodeContextLabel }}
            </template>
            <!-- an item started from the car has no date -->
            <template #right>
              {{ currentEpisode?.fromAuto ? "" : getDate(currentEpisode) }}
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
        <template #header-content>
          <div>
            <Accordion
              v-if="playlistQueueState.items.length > 1"
              value="null"
              class="mb-5 playlist-accordion xs:-mx-4 sm:mx-0"
            >
              <AccordionPanel value="0" style="border: none">
                <AccordionHeader><MoreEpisodesIcon />Playlist</AccordionHeader>
                <AccordionContent>
                  <PlaylistQueue header="" class="px-0 -mx-3" />
                </AccordionContent>
              </AccordionPanel>
            </Accordion>
          </div>
        </template>
        <template #expanded-content>
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
        .media-info .show-image {
          // to prevent a jump when the image finally loads and renders
          height: 144px;
          .image {
            width: 144px;
            height: 144px;
          }
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
          pointer-events: none;
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
