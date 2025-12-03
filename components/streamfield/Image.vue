<script setup lang="ts">
import type { ImageBlock } from "../../composables/types/StreamfieldBlock"

defineProps<{
  block: ImageBlock
}>()
</script>

<template>
  <VImage
    v-if="block.value.image"
    :src="block.value.image"
    :size="{
      xxs: [316, 210],
      xs: [517, 344],
      sm: [709, 472],
      md: [885, 589],
      lg: [757, 504],
      xl: [923, 614],
      xxl: [688, 458],
    }"
    :maxHeight="block.value.image.height"
    :maxWidth="block.value.image.width"
    allowVerticalEffect
    :alt="block.value.image.alt"
  >
    <template #caption>
      <VImageCaption
        v-if="block.value.caption || block.value.image.caption"
        :text="block.value.caption || block.value.image.caption"
      />
    </template>
  </VImage>
</template>
