<script setup lang="ts">
import PlayIcon from '~/components/icons/PlayIcon.vue'
import PauseIcon from '~/components/icons/PauseIcon.vue'

const props = defineProps({
  label: {
    type: String,
    default: 'Play',
  },
  live: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  isPLaying: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['on-click'])

// handles the click event
const togglePlay = () => {
  emit('on-click')
}
</script>

<template>
  <div class="small-play">
    <Button severity="secondary" @click="togglePlay">
      <slot name="icon">
        <div
          class="flex align-items-center icon relative"
          :class="[{ live: props.live, paused: !props.isPLaying }]"
        >
          <CircularProgressBar />
          <PlayIcon v-if="!props.isPLaying" />
          <PauseIcon v-else />
        </div>
      </slot>
      <slot>
        <div class="content flex gap-1 white-space-nowrap">
          <span>{{ props.label }}</span>

          <span v-if="props.live" class="flex gap-2 align-items-center">
            <LiveIndicator />
            <span>LIVE</span>
          </span>
        </div>
      </slot>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.small-play {
  .p-button {
    padding: 0.25rem 0.75rem;
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
  }
  .content {
    font-size: 14px;
    font-weight: 700;
    line-height: normal;
  }
}
</style>
