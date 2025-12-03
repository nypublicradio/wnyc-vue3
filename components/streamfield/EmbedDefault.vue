<script setup lang="ts">
import type { EmbedBlock } from "../../composables/types/StreamfieldBlock"

defineProps<{
  block: EmbedBlock
}>()
</script>

<template>
  <div v-html="block.value.embed" />
</template>

<style lang="scss">
.streamfield-embed {
  &.youtube {
    iframe {
      aspect-ratio: 16 / 9 !important;
      width: 100% !important;
      height: 100% !important;
    }
  }
}
</style>
