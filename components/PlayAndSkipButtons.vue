<script setup>
import { isLiveStream } from "~/utilities/helpers"
import {
  useIsEpisodePlaying,
  useTogglePlayTrigger,
  useSkipAheadTrigger,
  useSkipBackTrigger,
} from "~/composables/states"

const isEpisodePlaying = useIsEpisodePlaying()
const togglePlayTrigger = useTogglePlayTrigger()
const skipAheadTrigger = useSkipAheadTrigger()
const skipBackTrigger = useSkipBackTrigger()

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
  return isLiveStream()
})
</script>

<template>
  <div class="play-and-skip-buttons flex gap-3 justify-content-center">
    <Button v-if="!isLive" severity="secondary" rounded @click="skipBack">
      <template #icon> <Previous10 /></template>
    </Button>
    <Button v-if="isEpisodePlaying" severity="secondary" rounded @click="togglePlay">
      <template #icon> <PauseIcon /></template>
    </Button>
    <Button v-else severity="secondary" rounded @click="togglePlay">
      <template #icon> <PlayIcon /></template>
    </Button>
    <Button v-if="!isLive" severity="secondary" rounded @click="skipAhead">
      <template #icon> <Next10 /></template>
    </Button>
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
