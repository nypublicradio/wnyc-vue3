<script setup>
import { de } from "date-fns/locale"

const props = defineProps({
  progress: {
    type: Object,
    default: { loadedBytes: 0, totalBytes: 0, percentage: 0 },
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
})

const theProgress = computed(() => {
  return Math.round(props.progress.percentage)
})
</script>

<template>
  <div class="download-progress">
    <DownloadedSmallIcon
      v-if="theProgress === 100 || props.isDownloaded"
      style="height: 16px; width: 29px"
    />
    <div v-else class="spin-holder">
      <i class="pi pi-spin pi-spinner"></i>
      <div class="percent">{{ theProgress }}</div>
      <!-- <i class="pi pi-download absolute"></i> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-progress {
  display: inherit;
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
}
</style>
