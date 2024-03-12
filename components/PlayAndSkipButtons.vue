<script setup>
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useSkipAheadTrigger,
  useSkipBackTrigger,
  useIsLiveStream,
  useIsStreamLoading,
} from "~/composables/states"

const props = defineProps({
  /**
   * hide skip buttons
   */
  hideSkip: {
    default: false,
    type: Boolean,
  },
})

const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const skipAheadTrigger = useSkipAheadTrigger()
const skipBackTrigger = useSkipBackTrigger()
const isLiveStream = useIsLiveStream()
const isStreamLoading = useIsStreamLoading()

const emit = defineEmits(["beforeTogglePlay", "beforeSkipAhead", "beforeSkipBack"])

// handles the click on the play button to toggle play
const togglePlay = () => {
  emit("beforeTogglePlay")
  togglePlayTrigger.value = !togglePlayTrigger.value
}

// handles the click on the skip ahead button
const skipAhead = () => {
  emit("beforeSkipAhead")
  skipAheadTrigger.value = !skipAheadTrigger.value
}

// handles the click on the skip back button
const skipBack = () => {
  emit("beforeSkipBack")
  skipBackTrigger.value = !skipBackTrigger.value
}

const isLive = computed(() => {
  return isLiveStream.value
})
</script>

<template>
  <div class="play-and-skip-buttons flex gap-3 justify-content-center">
    <template v-if="!props.hideSkip">
      <Button v-if="!isLive" severity="secondary" rounded @click="skipBack">
        <template #icon> <Previous10 /></template>
      </Button>
    </template>
    <Button
      v-if="isEpisodePlaying && !isStreamLoading"
      severity="secondary"
      rounded
      @click="togglePlay"
    >
      <template #icon> <PauseIcon /></template>
    </Button>
    <Button v-else-if="!isStreamLoading" severity="secondary" rounded @click="togglePlay">
      <template #icon> <PlayIcon /></template>
    </Button>
    <Button v-if="isStreamLoading" severity="secondary" rounded>
      <template #icon>
        <i v-if="isStreamLoading" class="pi pi-spin pi-spinner"></i
      ></template>
    </Button>

    <template v-if="!props.hideSkip">
      <Button v-if="!isLive" severity="secondary" rounded @click="skipAhead">
        <template #icon> <Next10 /></template>
      </Button>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.play-and-skip-buttons {
  .p-button {
    width: 50px;
    height: 50px;
    .play-icon,
    .pause-icon {
      width: 20px;
      height: 20px;
    }
  }
}
</style>
