<script setup lang="ts">
import type { ctaBlock } from "../../composables/types/StreamfieldBlock"
import { getRouteOrLink } from "~/utilities/helpers"

const props = defineProps<{
  block: ctaBlock
}>()
const ratio = [
  props.block.value.image.height || 3,
  props.block.value.image.width || 2,
]

const widthsObj = {
  xxs: 316,
  xs: 517,
  sm: 709,
  md: 885,
  lg: 923,
  xl: 610,
}
const link = getRouteOrLink(props.block.value.url)
const image = props.block.value.image

// calculate the height of the image based on the ratio
const getHeight = (w: number) => Math.round((w * ratio[0]) / ratio[1])

const ctaImageSize = Object.fromEntries(
  Object.entries(widthsObj).map(([k, w]) => [k, [w, getHeight(w)]])
) as Record<keyof typeof widthsObj, [number, number]>
</script>

<template>
  <VFlexibleLink
    :to="link"
    v-if="image && link"
    raw
    class="block m-auto cta-block-width"
  >
    <VImage
      :src="image"
      :size="ctaImageSize"
      :maxHeight="image.height"
      :maxWidth="image.width"
      :allowVerticalEffect="false"
      :alt="`${props.block.type}-${props.block.id}-image`"
    />
  </VFlexibleLink>
</template>

<style scoped>
.cta-block-width {
  max-width: 610px;
}
</style>
