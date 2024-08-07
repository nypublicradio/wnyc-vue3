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
  index: {
    type: Number,
    default: 0,
  },
  /* file filed to match up agaist or, if playing a downloaded file, the directoryAudio.name to match up against */
  data: {
    default: {},
    type: Object,
  },
})

const emit = defineEmits(["on-click"])

// handles the click event
const togglePlay = () => {
  emit("on-click")
}

const getProgress = computed(() => {
  return Math.ceil((currentEpisodeProgress.value / currentEpisodeDuration.value) * 100)
})

const isPlaying = ref(false)
watch(
  isEpisodePlaying,
  () => {
    // to handle segments\
    if (Array.isArray(props.data.audio)) {
      isPlaying.value = currentEpisode.value?.file === props.data?.audio[props.index]
    } else {
      isPlaying.value = Number(currentEpisode.value?.id) === Number(props.data?.id)
    }
  },
  {
    immediate: true,
  }
)
</script>

<template>
  <div class="small-play" :class="[{ circle: props.label === '' }]">
    <Button
      severity="secondary"
      @click.prevent="togglePlay"
      :aria-disabled="isStreamLoading"
      aria-label="play"
      tabindex="0"
      :class="[{ active: isPlaying }]"
      class="flex align-items-center cursor-pointer"
    >
      <slot name="icon">
        <Transition name="fade" mode="out-in">
          <div
            v-if="isPlaying && !isStreamLoading"
            class="flex align-items-center icon relative"
            :class="[{ live: props.live, paused: !isEpisodePlaying }]"
          >
            <CircularProgressBar :progress="getProgress" />
            <PlayIcon v-if="!isEpisodePlaying && !isStreamLoading" />
            <PauseIcon v-if="isEpisodePlaying && !isStreamLoading" />
            <i v-if="isStreamLoading" class="pi pi-spin pi-spinner"></i>
          </div>
          <div
            v-else-if="isPlaying && isStreamLoading"
            class="flex align-items-center icon relative"
          >
            <i class="pi pi-spin pi-spinner"></i>
          </div>
          <div v-else class="flex align-items-center icon">
            <PlayIcon />
          </div>
        </Transition>
      </slot>
      <slot>
        <div class="content flex white-space-nowrap align-items-center">
          <span class="center">{{ props.label }}</span>
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
    padding: 0.219rem 0.75rem;
    min-height: 28px;
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
    * {
      line-height: 1;
    }
  }
  &.circle {
    height: 40px;
    width: 40px;
    .p-button {
      height: 40px;
      width: 40px;
      .icon {
        .play-icon {
          margin: 0 0 0 2px;
        }
      }
    }
  }
}
</style>
