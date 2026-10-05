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
    object-fit="contain"
    :ratio="[16, 9]"
    :size="{
      xxs: [317],
      xs: [517],
      sm: [672],
      md: [885],
      lg: [662],
    }"
    :maxHeight="block.value.image.height"
    :maxWidth="block.value.image.width"
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
