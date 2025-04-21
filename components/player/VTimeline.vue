<script setup>
import { ref, onUpdated } from "vue"
import Slider from "primevue/slider"
const props = defineProps({
  /**
   * autoplay on load
   */
  minimized: {
    default: false,
    type: Boolean,
  },
  /**
   * alternate view for the timeline
   */
  slim: {
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

const emit = defineEmits([
  "scrub-timeline-change",
  "scrub-timeline-end",
  "scrub-timeline-click",
])

const currentEpisodeDuration = computed(() => props.currentEpisodeDuration)
const currentEpisodeProgress = computed(() => props.currentEpisodeProgress)
const isLiveStream = computed(() => props.isLiveStream)
const isDragging = ref(false)
const jumpToValue = ref(0)

const progress = ref(currentEpisodeDuration.value)
onUpdated(() => {
  if (!isDragging.value) {
    progress.value = Math.floor(
      (props.currentEpisodeProgress / props.currentEpisodeDuration) * 100
    )
  }
})

// format time in minutes and seconds
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.floor(seconds % 60)
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

// handles dragging on the timeline
const handleDragging = (value) => {
  emit("scrub-timeline-change", value)
  isDragging.value = true
  jumpToValue.value = value
  progress.value = value
}
// handles drag end on the timeline
const handleDragEnd = (data) => {
  emit("scrub-timeline-end", data.value)
  isDragging.value = false
  progress.value = data.value
}
// handles click on the timeline
const handleClick = () => {
  // uses the jumpToValue.value from the change event in the handleDragging function
  emit("scrub-timeline-click", jumpToValue.value)
  handleDragEnd({ value: jumpToValue.value })
}
</script>

<template>
  <div
    class="timeline-holder flex gap-2"
    :class="[{ minimized: props.minimized, slim: props.slim }]"
  >
    <Slider
      v-if="!isLiveStream"
      v-model="progress"
      class="timeline"
      :min="0.1"
      :max="100"
      aria-label="progress slider"
      title="progress slider"
      aria-labelledby="progress slider"
      @slideend="handleDragEnd"
      @click="handleClick"
      @update:modelValue="handleDragging"
    />
    <div v-else>LIVE</div>
    <div
      class="time inline-flex align-self-center gap-1"
      v-if="!isLiveStream && props.slim"
    >
      <p>{{ formatTime(currentEpisodeProgress) }}</p>
      <p>/</p>
      <p>{{ formatTime(currentEpisodeDuration) }}</p>
    </div>
    <div
      v-if="!isLiveStream && !props.minimized"
      class="time flex justify-content-between w-full mt-2"
    >
      <p>{{ formatTime(currentEpisodeProgress) }}</p>
      <p>{{ formatTime(currentEpisodeDuration) }}</p>
    </div>
  </div>
</template>

<style lang="scss">
.timeline-holder {
  .timeline {
    position: relative;
    width: 100%;
  }
  &.slim {
    display: inline-flex;
    align-self: center;
    height: 3px !important;
    .p-slider-handle {
      background: transparent;
      transition: background var(--p-transition-duration);
      -webkit-transition: background var(--p-transition-duration);
      &:before {
        transition: transform var(--p-transition-duration);
        -webkit-transition: transform var(--p-transition-duration);
        transform: scale(0.2);
      }
      &:hover {
        background: inherit;
        &:before {
          transform: scale(1);
        }
      }
    }
  }
  &.minimized {
    @include media("<lg") {
      position: absolute;
      left: 0;
      bottom: 0;
      pointer-events: none;
      height: 2px !important;
      margin: 0;
      .p-slider-handle {
        display: none;
      }
      .time {
        display: none !important;
      }
    }
  }
}
</style>
