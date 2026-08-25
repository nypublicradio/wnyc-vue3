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
    sizes="lg:672px md:885px sm:709px xs:517px xxs:316px"
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
