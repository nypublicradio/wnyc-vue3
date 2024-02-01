<script setup lang="ts">
import PlayIcon from "~/components/icons/PlayIcon.vue"
import PauseIcon from "~/components/icons/PauseIcon.vue"

import {
  useCurrentEpisode,
  useIsStreamLoading,
  useIsEpisodePlaying,
  useCurrentEpisodeDuration,
  useCurrentEpisodeProgress,
} from "~/composables/states"

const isEpisodePlaying = useIsEpisodePlaying()
const currentEpisode = useCurrentEpisode()
const isStreamLoading = useIsStreamLoading()
const currentEpisodeDuration = useCurrentEpisodeDuration()
const currentEpisodeProgress = useCurrentEpisodeProgress()

const props = defineProps({
  label: {
    type: String,
    default: "Play",
  },
  live: {
    type: Boolean,
    default: false,
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  file: {
    default: "",
    type: String,
  },
})

const emit = defineEmits(["on-click"])

// handles the click event
const togglePlay = () => {
  if (!isStreamLoading.value) {
    emit("on-click")
  }
}

const checkEpisodeMatchAndPlaying = computed(() => {
  if (currentEpisode.value) {
    if (currentEpisode.value.file === props.file && isEpisodePlaying.value) {
      return true
    }
  }
  return false
})

const checkEpisodeMatch = computed(() => {
  if (currentEpisode.value) {
    if (currentEpisode.value.file === props.file) {
      return true
    }
  }
  return false
})

const getProgress = computed(() => {
  return Math.ceil((currentEpisodeProgress.value / currentEpisodeDuration.value) * 100)
})
</script>

<template>
  <div class="small-play">
    <Button
      severity="secondary"
      @click.prevent="togglePlay"
      :aria-disabled="isStreamLoading"
      :class="[{ active: checkEpisodeMatch }, { anim: checkEpisodeMatchAndPlaying }]"
    >
      <slot name="icon">
        <div
          v-if="checkEpisodeMatch"
          class="flex align-items-center icon relative"
          :class="[{ live: props.live, paused: !isEpisodePlaying }]"
        >
          <CircularProgressBar :progress="getProgress" />
          <PlayIcon v-if="!isEpisodePlaying && !isStreamLoading" />
          <PauseIcon v-if="isEpisodePlaying && !isStreamLoading" />
          <i v-if="isStreamLoading" class="pi pi-spin pi-spinner"></i>
        </div>
        <div v-else class="flex align-items-center icon">
          <PlayIcon />
        </div>
      </slot>
      <slot>
        <div class="content flex white-space-nowrap">
          <span>{{ props.label }}</span>
          <LiveBadge
            v-if="props.live"
            font-size="14px"
            bg-color="transparent"
            padding="1px 8px 1px 3px"
          />
          <DownloadedSmallIcon v-if="props.isDownloaded" class="ml-2" />
        </div>
      </slot>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.small-play {
  .p-button {
    padding: 0.25rem 0.75rem;
    &.active {
      //border: var(--night) 1px solid;
    }
  }
  .icon {
    margin-right: 0.25rem;
    .circular-progress-bar {
      position: absolute;
      left: -6px;
      right: 0;
      margin: auto;
    }
    &.live {
      .circular-progress-bar {
        display: none;
      }
    }
    &:not(.live) {
      margin-right: 0.5rem;
      .pause-icon {
        height: 8px;
      }
    }
    &.paused {
      .circular-progress-bar {
        display: none;
      }
    }
    .pi-spinner {
      font-size: 13px;
    }
  }
  .content {
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
    align-items: center;
  }
}
</style>
