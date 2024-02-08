<script setup>
const props = defineProps({
  //   percent: {
  //     type: Number,
  //     default: 0,
  //   },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="download-progress">
    <DownloadedSmallIcon v-if="props.isDownloaded" />
    <div v-else>
      <i class="pi pi-spin pi-spinner"></i>
      <!-- <i class="pi pi-download absolute"></i> -->
    </div>
  </div>
</template>

<style lang="scss" scoped>
.download-progress {
}
</style>
