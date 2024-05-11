<script setup>
const props = defineProps({
  progress: {
    type: Object,
    default: { loadedBytes: 0, totalBytes: 0, percentage: 0 },
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
  small: {
    type: Boolean,
    default: false,
  },
})

const animateComplete = ref(!props.isDownloaded)

const theProgress = computed(() => {
  return Math.round(props.progress?.percentage)
})
</script>

<template>
  <div class="download-progress" :class="[{ small: props.small }]">
    <DownloadedSmallIcon
      class="check-icon"
      v-if="theProgress === 100 || props.isDownloaded"
      :animate="animateComplete"
    />
    <div v-else class="spin-holder">
      <i class="pi pi-spin pi-spinner"></i>
      <div class="percent" v-if="theProgress > 0">{{ theProgress }}</div>
      <!-- <i class="pi pi-download absolute"></i> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-progress {
  display: inherit;
  color: var(--text-color);
  .check-icon {
    width: 29px;
    height: 16px;
  }
  .spin-holder {
    display: flex;
    align-items: center;
    justify-content: center;
    .pi-spinner {
      font-size: 29px;
      z-index: 1;
    }
    .percent {
      font-size: 8px;

      text-align: center;
      position: absolute;
    }
  }
  &.small {
    .check-icon {
      width: 16px;
    }
    .spin-holder {
      .pi-spinner {
        font-size: 14px;
      }
      .percent {
        display: none;
      }
    }
  }
}
</style>
