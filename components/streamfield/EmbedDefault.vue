<script setup lang="ts">
import { computed } from 'vue'
import type { EmbedBlock } from "../../composables/types/StreamfieldBlock"

const props = defineProps<{
  block: EmbedBlock
}>()

// Intercept the raw HTML embed and rewrite absolute WNYC widget URLs to relative paths
const processedEmbed = computed(() => {
  let html = props.block.value.embed
  if (html) {
    // Basic string replacement for any absolute WNYC URL to force local routing
    html = html.replace(/https?:\/\/(www\.)?wnyc\.org\//g, '/')
  }
  return html
})
</script>

<template>
  <ClientOnly>
    <div v-html="processedEmbed" />
  </ClientOnly>
</template>

<style lang="scss">
.streamfield .youtube iframe {
  aspect-ratio: 16 / 9 !important;
  width: 100% !important;
  height: 100% !important;
}
</style>
