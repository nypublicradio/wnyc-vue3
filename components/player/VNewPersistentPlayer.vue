<script setup lang="ts">
import GoogleCastIcon from "../icons/GoogleCastIcon.vue"

import VNewTrackInfo from "./VNewTrackInfo.vue"
import { useSwipe } from "@vueuse/core"
import Button from "primevue/button"
import { nextTick, onMounted, ref, watch } from "vue"
import { useIsApp } from "~/composables/states"

const props = defineProps({
  /**
   * get if the stream is buffering / loading
   */
  isStreamLoading: {
    default: true,
    type: Boolean,
  },
  /**
   * get if the audio is playing
   */
  isEpisodePlaying: {
    default: false,
    type: Boolean,
  },
  /**
   * get if the audio is a live stream or on demand
   */
  isLiveStream: {
    default: false,
    type: Boolean,
  },
  /**
   * get if the audio duration
   */
  currentEpisodeDuration: {
    default: 0,
    type: Number,
  },
  /**
   * get if the audio duration progress
   */
  currentEpisodeProgress: {
    default: 0,
    type: Number,
  },
  /**
   * expand the player by clicking anywhere but the control buttons
   */
  canClickAnywhere: {
    default: false,
    type: Boolean,
  },
  /**
   * make the player expandable
   */
  canExpand: {
    default: false,
    type: Boolean,
  },
  /**
   * expand the player with up swipe actions
   */
  canExpandWithSwipe: {
    default: false,
    type: Boolean,
  },
  /**
   * make the player minimizable
   */
  canMinimize: {
    default: false,
    type: Boolean,
  },
  /**
   * can unexpand the player with down swipe actions
   */
  canUnexpandWithSwipe: {
    default: false,
    type: Boolean,
  },
  /**
   * description text
   */
  description: {
    default: null,
    type: String,
  },
  /**
   * link for the description
   */
  descriptionLink: {
    default: null,
    type: String,
  },
  /**
   * hide the description on mobile container breakpoint
   */
  hideDescriptionOnMobile: {
    default: false,
    type: Boolean,
  },
  /**
   * hide the download button on mobile
   */
  hideDownloadMobile: {
    default: true,
    type: Boolean,
  },
  /**
   * hide the image on mobile container breakpoint
   */
  hideImageOnMobile: {
    default: false,
    type: Boolean,
  },
  /**
   * hide the skip buttons on mobile
   */
  hideSkipMobile: {
    default: true,
    type: Boolean,
  },
  /**
   * hide the time on mobile container breakpoint
   */
  hideTimeOnMobile: {
    default: false,
    type: Boolean,
  },
  /**
   * left image representing the audio
   */
  image: {
    default: null,
    type: [Object, String],
  },
  /**
   * left image representing the audio
   */
  imageSize: {
    default: 112,
    type: Number,
  },
  /**
   * left image representing the audio
   */
  imageSizeExpanded: {
    default: 144,
    type: Number,
  },
  /**
   * loading state
   */
  isLoading: {
    default: false,
    type: Boolean,
  },
  /**
   * muted state
   */
  isMuted: {
    default: false,
    type: Boolean,
  },
  /**
   * loop the audio when complete
   */
  loop: {
    default: false,
    type: Boolean,
  },
  marquee: {
    default: false,
    type: Boolean,
  },
  marqueeDelay: {
    default: "3s",
    type: String,
  },
  marqueeLoops: {
    default: "1",
    type: String,
  },
  marqueeSpeed: {
    default: 0.1,
    type: Number,
  },
  /**
   * show the download button
   */
  platform: {
    default: "android",
    type: String,
  },
  /**
   * show the download button
   */
  showDownload: {
    default: false,
    type: Boolean,
  },
  /**
   * show the cast button
   */
  showCast: {
    default: false,
    type: Boolean,
  },
  /**
   * show the skip buttons
   */
  showSkip: {
    default: true,
    type: Boolean,
  },
  /**
   * show the skip buttons
   */
  showVolume: {
    default: false,
    type: Boolean,
  },
  /**
   * radio station name
   */
  station: {
    default: null,
    type: String,
  },
  /**
   * the swipe speed threshhold to trigger the swipe action
   */
  swipeThreshold: {
    default: 0.5,
    type: Number,
  },
  /**
   * the timeline is at the bottom of the player
   */
  timelineBottom: {
    default: false,
    type: Boolean,
  },
  /**
   * the timeline is interactive
   */
  timelineInteractive: {
    default: true,
    type: Boolean,
  },
  /**
   * the timeline is at the top of the player
   */
  timelineTop: {
    default: false,
    type: Boolean,
  },
  /**
   * title of the audio
   */
  title: {
    default: null,
    type: String,
  },
  /**
   * link for the title
   */
  titleLink: {
    default: null,
    type: String,
  },
  /**
   * volume state
   */
  volume: {
    default: 1,
    type: Number,
  },
})

const emit = defineEmits([
  "toggle-play",
  "volume-toggle-mute",
  "volume-change",
  "error",
  "skip-ahead",
  "skip-back",
  "scrub-timeline-change",
  "scrub-timeline-end",
  "scrub-timeline-click",
  "image-click",
  "description-click",
  "title-click",
  "is-minimized",
  "is-expanded",
  "swipe-up",
  "swipe-down",
])
const isApp = useIsApp()
const isStreamLoading = computed(() => props.isStreamLoading)
const isEpisodePlaying = computed(() => props.isEpisodePlaying)
const isLiveStream = computed(() => props.isLiveStream)
const currentEpisodeDuration = computed(() => props.currentEpisodeDuration)
const currentEpisodeProgress = computed(() => props.currentEpisodeProgress)
//const volume = ref(props.volume)
//swipe setup
const playerRef = ref(null)

//const remote = new MediaRemoteControl()
const playButtonRef = ref(null)
const isMinimized = ref(false)
const isExpanded = ref(false)
const isMounted = ref(false)

// expanded player content scrolling container
const expandedContentHolder = ref(null)

// prevents the body from scrolling when the dropdown is open
function preventScrollOnTouch(event) {
  event.preventDefault()
}
const supportSwipe =
  (props.canExpand && props.canExpandWithSwipe) ||
  (props.canExpand && props.canUnexpandWithSwipe)

// swipe setup
let touchstartY = 0
let touchendY = 0
let touchPrevY = 0
let touchCurrentY = 0
let touchstartTime = 0
let touchendTime = 0
const swipeThreshold = props.swipeThreshold
let isDraggingDown = false

// handles the detection of the direction of the drag movment
function handleSwipeDirection() {
  const tempBool = isDraggingDown
  if (touchCurrentY < touchPrevY) {
    isDraggingDown = true
  }
  if (touchCurrentY > touchPrevY) {
    isDraggingDown = false
  }
  //reset the touchstartY and touchstartTime if the direction changes
  if (tempBool !== isDraggingDown) {
    touchstartY = touchCurrentY
    touchstartTime = new Date().getTime()
  }
}

// handle scroll blocking with js when player is expanded
const scrollToggle = (e) => {
  if (e) {
    playerRef.value.removeEventListener("touchmove", preventScrollOnTouch, {
      passive: false,
    })
  } else {
    playerRef.value.addEventListener("touchmove", preventScrollOnTouch, {
      passive: false,
    })
  }
}
// exposed method to handle the expanding toggle
const toggleExpanded = (e) => {
  scrollToggle(e)
  emit("is-expanded", e)
  isExpanded.value = e
}

// handles the swipe ended logic
function handleSwipe() {
  const distance = Math.abs(touchendY - touchstartY)
  const time = touchendTime - touchstartTime
  const velocity = distance / time
  if (props.canExpand && props.canExpandWithSwipe) {
    if (!isDraggingDown) {
      if (velocity > swipeThreshold) {
        //console.log('EXPAND')
        playerRef.value.removeEventListener("touchmove", preventScrollOnTouch, {
          passive: false,
        })
        toggleExpanded(true)
        emit("swipe-up")
      }
    }
  }
  if (props.canExpand && props.canUnexpandWithSwipe) {
    // only swipe closes when the scroll position is at the top
    if (isDraggingDown && expandedContentHolder.value.scrollTop === 0) {
      if (velocity > swipeThreshold) {
        //console.log('UNEXPAND')
        playerRef.value.addEventListener("touchmove", preventScrollOnTouch, {
          passive: false,
        })
        toggleExpanded(false)
        emit("swipe-down")
      }
    }
  }
}

if (supportSwipe) {
  const swipe = useSwipe(playerRef, {
    onSwipe() {
      touchCurrentY = swipe.lengthY.value

      handleSwipeDirection()
      touchPrevY = touchCurrentY
    },
    onSwipeEnd() {
      touchendY = swipe.lengthY.value
      touchendTime = new Date().getTime()
      handleSwipe()
    },
    onSwipeStart() {
      touchstartY = swipe.lengthY.value
      touchstartTime = new Date().getTime()
    },
    passive: true,
  })
}
// initially set touchmove prevent default on the playerRef
onMounted(() => {
  isMounted.value = true
  if (supportSwipe) {
    playerRef.value.addEventListener("touchmove", preventScrollOnTouch, {
      passive: false,
    })
  }
})
// END swipe

// handle the toggle play event
const togglePlay = () => {
  // Play or pause the sound.
  emit("toggle-play", !isEpisodePlaying.value)
}

// handle the volume toggle mute event
const volumeToggleMute = (e) => {
  emit("volume-toggle-mute", e)
}

// handle the volume change event
const volumeChange = (e) => {
  emit("volume-change", e / 100)
}

// exposed method to handle the minimize toggle
const toggleMinimize = (e) => {
  emit("is-minimized", e)
  isMinimized.value = e
}

watch(isExpanded, () => {
  // set expanded content scroll position to top
  expandedContentHolder.value.scrollTop = 0
})

// exposed method to handle the skip ahead
const skipAhead = () => {
  emit("skip-ahead")
}

// exposed method to handle the skip back
const skipBack = () => {
  emit("skip-back")
}

// cast to google
const castToGoogleCast = () => {
  try {
    //console.log("request google cast")
    //await $mediaPlayerRef.value.requestGoogleCast()
  } catch (e) {
    //console.log("error casting to google cast", e)
    emit("error", e)
    // Throws if not supported or the dialog is cancelled.
  }
}
// cast to apple air play
const castToAirPlay = () => {
  try {
    //console.log("request airplay")
    //await $mediaPlayerRef.value.requestAirPlay()
  } catch (e) {
    //console.log("error casting to air play", e)
    emit("error", e)
    // Throws if not supported or the dialog is cancelled.
  }
}
// exposed method to handle the cast
const handleCast = () => {
  if (props.platform === "android") {
    castToGoogleCast()
  } else {
    castToAirPlay()
  }
}

// handles the click anywhere prop. So if the user clicks anywhere on the player, except the buttons, the player will expand or minimize
const handleClickAnywhere = (e) => {
  //console.log("anywhere click")
  if (props.canClickAnywhere) {
    e.preventDefault()
    if (props.canExpand) {
      toggleExpanded(!isExpanded.value)
    }
    if (props.canMinimize) {
      toggleMinimize(!isMinimized.value)
    }
  }
}

onMounted(async () => {
  // keyboard accessibility
  window.addEventListener("keydown", (event) => {
    switch (event.code) {
      case "ArrowUp":
        if (props.volume < 1) {
          emit("volume-change", props.volume + 0.1)
        }
        break
      case "ArrowDown":
        if (props.volume > 0) {
          emit("volume-change", props.volume - 0.1)
        }
        break
      default:
        /* code */
        break
    }
  })

  await nextTick()
})

defineExpose({
  skipAhead,
  skipBack,
  toggleExpanded,
  toggleMinimize,
  togglePlay,
})
</script>

<template>
  <div
    ref="playerRef"
    class="persistent-player"
    :class="[
      { minimized: isMinimized },
      { expanded: isExpanded },
      { app: isApp },
      { browser: !isApp },
    ]"
  >
    <Transition name="expand">
      <div v-show="!isExpanded">
        <div class="content flex h-full align-items-center">
          <div
            class="track-info-image flex-none"
            :class="[{ hideImageOnMobile: props.hideImageOnMobile }]"
          >
            <div
              :class="[{ 'cursor-pointer': props.canClickAnywhere }]"
              @click="handleClickAnywhere"
            >
              <VFlexibleLink
                class="track-info-image-link"
                :to="props.titleLink ?? null"
                raw
                :title="props.titleLink ?? null"
                @flexible-link-click="emit('image-click')"
              >
                <!-- {{ props.image }} -->
                <VImage
                  :src="props.image"
                  :width="props.imageSize"
                  :height="props.imageSize"
                  :sizes="`xs:${props.imageSize * 2}px`"
                  :alt="props.title"
                  :ratio="[1, 1]"
                  role="presentation"
                />
              </VFlexibleLink>
            </div>
          </div>

          <div
            class="flex justify-content-between w-full h-full pl-3 pr-3 lg:pr-2 gap-3 relative"
          >
            <!-- {{ props.title }}
            {{ props.description }} -->
            <VNewTrackInfo
              v-bind="{ ...$props, ...$attrs }"
              :livestream="isLiveStream"
              :class="[{ 'cursor-pointer': props.canClickAnywhere }]"
              @description-click="emit('description-click')"
              @title-click="emit('title-click')"
              @click="handleClickAnywhere"
              class="flex-grow-1"
            />
            <div
              class="middle-btns flex flex-column align-items-center justify-content-center gap-1 flex-grow-1"
            >
              <div class="btns flex align-items-center justify-content-center">
                <Transition name="skipBtnL">
                  <Button
                    v-if="props.showSkip"
                    class="media-button flex-none p-button-icon-only skip-btn flex-grow-1"
                    severity="secondary"
                    @click="skipBack"
                    :disabled="isLiveStream"
                  >
                    <slot name="skipBack"><i class="pi pi-undo"></i></slot>
                  </Button>
                </Transition>
                <Button
                  ref="playButtonRef"
                  :disabled="isStreamLoading"
                  class="media-button play-button p-button-icon-only z-1"
                  :aria-label="isEpisodePlaying ? 'Pause button' : 'Play button'"
                  @click="togglePlay"
                  severity="secondary"
                >
                  <slot v-if="isStreamLoading" name="loading">
                    <i class="pi pi-spin pi-spinner"></i>
                  </slot>
                  <slot v-else-if="!isEpisodePlaying" name="play"
                    ><i class="pi pi-play"></i
                  ></slot>
                  <slot v-else name="pause"><i class="pi pi-pause"></i></slot>
                </Button>
                <Transition name="skipBtnR">
                  <Button
                    v-if="props.showSkip"
                    class="media-button flex-none p-button-icon-only p-button-secondary skip-btn"
                    severity="secondary"
                    :disabled="isLiveStream"
                    @click="skipAhead"
                  >
                    <slot name="skipAhead"><i class="pi pi-refresh"></i></slot>
                  </Button>
                </Transition>
              </div>
              <div class="w-full">
                <player-v-timeline
                  :currentEpisodeProgress
                  :currentEpisodeDuration
                  :isLiveStream
                  minimized
                  slim
                  @scrub-timeline-end="emit('scrub-timeline-end', $event)"
                />
              </div>
            </div>
            <div
              class="right-btns flex align-items-center justify-content-end gap-2 flex-grow-1"
            >
              <player-v-volume-control
                v-if="props.showVolume"
                class="hidden lg:flex"
                :volume="props.volume * 100"
                :is-muted="props.isMuted"
                @volume-toggle-mute="volumeToggleMute"
                @volume-change="volumeChange"
              />
              <Button
                v-if="props.canExpand"
                class="flex-none p-button-icon-only p-button-secondary"
                severity="secondary"
                variant="text"
                title="Expand player button"
                @click="toggleExpanded(true)"
              >
                <slot name="expand"><i class="pi pi-expand"></i></slot>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="expand-delay">
      <div v-show="isExpanded" class="expanded-view">
        <div ref="expandedContentHolder" class="content expanded-content-holder">
          <div class="header">
            <slot name="expanded-header">
              <div class="flex justify-content-between flex-row-reverse">
                <Button
                  class="unexpand-btn p-button-icon-only p-button-secondary"
                  aria-label="close expanded player button"
                  variant="text"
                  severity="secondary"
                  rounded
                  title="Minimize player button"
                  @click="toggleExpanded(!isExpanded)"
                >
                  <slot name="unexpanded-button-icon">
                    <i class="pi pi-chevron-down" />
                  </slot>
                </Button>
                <Button
                  v-if="props.showCast"
                  id="castBtn"
                  severity="secondary"
                  text
                  rounded
                  aria-label="Google Cast"
                  class="cast-btn header-cast-btn"
                  @click="handleCast"
                >
                  <GoogleCastIcon />
                </Button>
              </div>
            </slot>
          </div>
          <div class="flex flex-column header-top">
            <slot name="header-content"></slot>

            <div class="flex flex-column gap-3">
              <!--   <pre class="text-xs">{{ currentEpisode }}</pre> -->
              <VImage
                :src="props.image"
                :alt="`${props.title} show image`"
                :size="{ xs: [props.imageSizeExpanded, props.imageSizeExpanded] }"
                :sizes="`xs:${props.imageSizeExpanded * 2}px`"
                class="show-image m-auto"
                :ratio="[1, 1]"
                role="presentation"
                style="background-color: #ffffff"
              />
              <div v-if="isLiveStream" class="flex flex-column gap-2">
                <div class="live flex gap-2 align-items-center">
                  <LiveBadge fontSize="0.65rem" />
                  <div class="text-sm md:text-base">{{ props.station }}</div>
                </div>
                <slot name="expanded-player-title">{{ props.title }}</slot>
              </div>

              <div v-else>
                <slot name="expanded-player-title">{{ props.title }}</slot>
              </div>
            </div>

            <div class="expandedViewPlayer mt-5">
              <player-v-timeline
                :currentEpisodeProgress
                :currentEpisodeDuration
                :isLiveStream
                @scrub-timeline-end="emit('scrub-timeline-end', $event)"
                @scrub-timeline-change="emit('scrub-timeline-change', $event)"
                @scrub-timeline-click="emit('scrub-timeline-click', $event)"
              />

              <div
                class="flex justify-content-center align-items-center gap-2"
                :class="isLiveStream ? 'mt-5' : 'mt-2'"
              >
                <Transition name="skipBtnL">
                  <Button
                    v-if="!isLiveStream"
                    class="media-button flex-none p-button-icon-only"
                    severity="secondary"
                    @click="skipBack"
                  >
                    <slot name="skipBack"><i class="pi pi-undo"></i></slot>
                  </Button>
                </Transition>
                <Button
                  ref="playButtonRef"
                  :disabled="isStreamLoading"
                  class="media-button media-button-expanded-play play-button p-button-icon-only"
                  :aria-label="isEpisodePlaying ? 'Pause button' : 'Play button'"
                  @click="togglePlay"
                  severity="secondary"
                >
                  <slot v-if="isStreamLoading" name="loading">
                    <i class="pi pi-spin pi-spinner"></i>
                  </slot>
                  <slot v-else-if="!isEpisodePlaying" name="play"
                    ><i class="pi pi-play"></i
                  ></slot>
                  <slot v-else name="pause"><i class="pi pi-pause"></i></slot>
                </Button>
                <Transition name="skipBtnR">
                  <Button
                    v-if="!isLiveStream"
                    class="media-button flex-none p-button-icon-only p-button-secondary"
                    severity="secondary"
                    @click="skipAhead"
                  >
                    <slot name="skipAhead"><i class="pi pi-refresh"></i></slot>
                  </Button>
                </Transition>
              </div>
            </div>
          </div>

          <slot name="expanded-content"></slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss">
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);

.persistent-player {
  container-type: inline-size;
  bottom: 0;
  left: 0;
  height: var(--persistent-player-height);
  position: fixed;
  z-index: var(--persistent-player-z-index);
  width: 100%;
  color: var(--p-text-color);
  background-color: var(--persistent-player-bg);
  transition: bottom 0.25s, height calc(var(--p-transition-duration) * 2);
  -webkit-transition: bottom 0.25s, height calc(var(--p-transition-duration) * 2);
  display: flex;
  flex-direction: column;

  &.minimized {
    bottom: calc(
      calc(var(--persistent-player-height) * -1) - var(--persistent-player-height-buffer)
    );
  }

  &.expanded {
    bottom: 0;
    height: 100%;
  }

  .right-btns {
    @include media("<md") {
      display: none !important;
    }
  }
  .middle-btns {
    max-width: 440px;
    .btns {
      gap: 0.8rem;
    }
    @include media("<lg") {
      flex-grow: 0 !important;
    }
  }
  .expanded-view {
    padding-top: env(safe-area-inset-top);
    position: relative;
    height: inherit;

    .expanded-content-holder {
      .header {
        position: sticky;
        top: 0;
        background-color: var(--persistent-player-bg);
        padding: 5px 0;
        z-index: 1;
      }

      position: relative;
      overflow-y: auto;
      overflow-x: hidden;
      height: inherit;
    }

    #expandedControls {
      min-height: 85px;
    }

    .cast-btn {
      padding: 0.5rem;
    }
  }

  video {
    display: none;
  }
}

//expand-delay
.expand-delay-enter-active {
  transition: opacity calc(var(--p-transition-duration) * 2) ease-out;
}

.expand-delay-leave-active {
  transition: opacity calc(var(--p-transition-duration) * 1) ease-in;
}

.expand-delay-enter-from,
.expand-delay-leave-to {
  opacity: 0;
}

//expand
.expand-enter-active {
  transition: opacity calc(var(--p-transition-duration) * 2) ease-out;
  transition-delay: calc(var(--p-transition-duration) * 1.5);
}

.expand-leave-active {
  transition: opacity 0s ease-in;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
}

//skipBtnR
.skipBtnR-enter-active {
  transition: opacity calc(var(--p-transition-duration) * 2) ease-out,
    transform calc(var(--p-transition-duration) * 2) ease-out;
  transition-delay: calc(var(--p-transition-duration) * 2.25);
}

.skipBtnR-leave-active {
  transition: opacity 0s ease-in, transform 0s ease-in;
}

.skipBtnR-enter-from {
  opacity: 0;
  transform: scale(0.8) translateX(-60px);
}

.skipBtnR-leave-to {
  opacity: 0;
  transform: scale(1) translateX(0);
}

//skipBtnL
.skipBtnL-enter-active {
  transition: opacity calc(var(--p-transition-duration) * 2) ease-out,
    transform calc(var(--p-transition-duration) * 2) ease-out;
  transition-delay: calc(var(--p-transition-duration) * 2.25);
}

.skipBtnL-leave-active {
  transition: opacity 0s ease-in, transform 0s ease-in;
}

.skipBtnL-enter-from {
  opacity: 0;
  transform: scale(0.8) translateX(60px);
}

.skipBtnL-leave-to {
  opacity: 0;
  transform: scale(1) translateX(0);
}
</style>

<style lang="scss">
.v-persistent-player-stop-window-scrolling {
  height: 100%;
  overflow: hidden;
}
</style>
<style lang="scss">
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);

.persistent-player {
  // .media-player {
  media-controls {
    // override inline pointer-events: none which stops the image click
    pointer-events: auto !important;
    width: 100%;
  }

  .track-info-image {
    //background-color: #ffffff;
    display: block;

    // prettier-ignore
    &.hideImageOnMobile {
      @container (max-width: #{$container-breakpoint-md}) {
        display: none;
      }
    }

    width: var(--persistent-player-image-size);
    max-width: var(--persistent-player-image-size);
    height: var(--persistent-player-image-size);

    //flex: 1 0 var(--persistent-player-image-size);
    .image-with-caption {
      width: var(--persistent-player-image-size);
    }
  }

  // secondary button override
  @mixin secondary-button {
    background: none;

    * {
      color: var(--p-text-color);
      fill: var(--p-text-color);
    }

    &:hover {
      * {
        color: var(--persistent-player-button-color-hover);
        fill: var(--persistent-player-button-color-hover);
      }
    }
  }

  // BUTTONS
  .media-button {
    display: inline-flex;
    position: relative;
    flex: none;
    justify-content: center;
    align-items: center;
    width: var(--persistent-player-button-width);
    height: var(--persistent-player-button-height);
    color: var(--persistent-player-button-color);
    border-radius: var(--persistent-player-button-radius);
    //margin-right: 2.5px;
    background: var(--persistent-player-button-bg-color);
    cursor: pointer;

    * {
      color: var(--persistent-player-button-color);
      fill: var(--persistent-player-button-color);
    }

    &.media-button-expanded-play {
      width: calc(var(--persistent-player-button-width) * 1.3);
      height: calc(var(--persistent-player-button-height) * 1.3);
    }

    .o-icon {
      width: 20px;
      height: 20px;
    }

    &.play-button {
      .play-icon {
        width: 17px;
        height: 17px;
        margin-top: 1px;
        margin-left: 3px;
      }

      .pause-icon {
        width: 11px;
        height: 13px;
      }
    }

    &.skip-btn {
      width: 24px;
      height: 24px;
      .o-icon {
        width: 14px;
        height: 14px;
      }
      @include media("<lg") {
        display: none;
      }
    }

    &:disabled {
      pointer-events: none;
      opacity: 0.3;
    }
  }

  @media (hover: hover) and (pointer: fine) {
    .media-button:hover {
      background: var(--persistent-player-button-bg-color-hover);
    }
  }
}
</style>
