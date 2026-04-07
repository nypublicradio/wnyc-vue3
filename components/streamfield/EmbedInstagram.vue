<script setup lang="ts">
import type { EmbedBlock } from "~/composables/types/StreamfieldBlock"

defineProps<{
  block: EmbedBlock
}>()

const el = ref(null)

onMounted(() => {
  const js = document.createElement("script")
  js.src = "//www.instagram.com/embed.js"
  el.value.appendChild(js)
})
</script>

<template>
  <ClientOnly>
    <div
      ref="el"
      class="streamfield-embed streamfield-embed- instagram streamfield-paragraph mb-7"
      v-html="block.value.embed"
    />
  </ClientOnly>
</template>

<style lang="scss">
.streamfield-embed {
  .instagram-media {
    margin: auto !important;
  }
}
</style>
