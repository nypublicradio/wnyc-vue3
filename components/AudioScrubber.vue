<script setup>
import VProgressScrubber from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VProgressScrubber.vue";
import {
  useCurrentEpisodeDuration,
  useCurrentEpisodeProgress,
  usePlayerSeek,
} from "~/composables/states";

const playerSeek = usePlayerSeek();
const currentEpisodeDuration = useCurrentEpisodeDuration();
const currentEpisodeProgress = useCurrentEpisodeProgress();

const percentComplete = computed(() => {
  return (currentEpisodeProgress.value / currentEpisodeDuration.value) * 100;
});

const progressRef = ref(percentComplete.value);
let scrubbing = false;

const onSlideEnd = (e) => {
  scrubbing = false;
  playerSeek.value.time = Math.round(e);
  playerSeek.value.bool = playerSeek.value.bool ? false : true;
};
const onChange = (e) => {
  scrubbing = true;
  progressRef.value = e;
};
const onClick = (e) => {
  playerSeek.value.time = Math.round(e);
  playerSeek.value.bool = playerSeek.value.bool ? false : true;
};

watch(percentComplete, (e) => {
  if (!scrubbing) progressRef.value = e;
});
</script>

<template>
  <div class="audio-scrubber">
    <VProgressScrubber
      :progress="progressRef"
      @scrub-timeline-change="onChange"
      @scrub-timeline-end="onSlideEnd"
      @timeline-click="onClick"
    />
  </div>
</template>

<style lang="scss">
.audio-scrubber {
  .progress-control {
    position: relative !important;
    left: unset !important;
    padding-bottom: 0.75rem;
    width: 100% !important;
    .p-slider-horizontal .p-slider-range {
      border-radius: 8px;
      height: 0.286rem;
    }
  }
  .p-slider-handle {
    display: block !important;
  }
  .track-info-time {
    display: flex !important;
    justify-content: space-between;
    .track-info-time-separator {
      display: none;
    }
  }
  .persistent-player {
    position: relative;
  }
}
</style>
