<script lang="ts" setup>
const props = defineProps({
  /**
   * autoplay on load
   */
  minimized: {
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
})

const currentEpisodeDuration = computed(() => props.currentEpisodeDuration)
const currentEpisodeProgress = computed(() => props.currentEpisodeProgress)
const isLiveStream = computed(() => props.isLiveStream)

const getEpisodeProgressPercentage = computed(() => {
  if (currentEpisodeDuration.value === 0) {
    return 0
  }
  return Math.floor((currentEpisodeProgress.value / currentEpisodeDuration.value) * 100)
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}
</script>

<template>
  <Slider
    class="timeline"
    :class="[{ minimized: props.minimized }]"
    v-model="getEpisodeProgressPercentage"
  />
  <div
    v-if="!isLiveStream && !props.minimized"
    class="flex justify-content-between w-full mt-2"
  >
    <p>{{ formatTime(currentEpisodeProgress) }}</p>
    <p>{{ formatTime(currentEpisodeDuration) }}</p>
  </div>
</template>

<style lang="scss">
.timeline {
  position: relative;
  width: 100%;
  height: 6px !important;
  background: var(--persistent-player-slider-buffer);
  .p-slider-range {
    background: var(--persistent-player-slider-progress);
    border-radius: 6px;
  }
  .p-slider-handle {
    border: 1px solid var(--persistent-player-slider-thumb-border);
    background-color: var(--persistent-player-slider-thumb-bg);
  }
  &.minimized {
    position: absolute;
    left: 0;
    bottom: 0;
    pointer-events: none;
    height: 2px !important;
    margin: 0;
    .p-slider-handle {
      display: none;
    }
  }
}
</style>
