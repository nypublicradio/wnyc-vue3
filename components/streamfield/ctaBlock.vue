<script setup lang="ts">
import type { ctaBlock } from "../../composables/types/StreamfieldBlock"

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
const getRoute = (url: string) => {
  if (!url) return url
  try {
    const parsedUrl = new URL(url)
    const internalRouteDomains = [
      "www.wnyc.org",
      "demo.wnyc.org",
      "www.demo.wnyc.org",
    ]
    if (internalRouteDomains.includes(parsedUrl.hostname)) {
      return parsedUrl.pathname + parsedUrl.search + parsedUrl.hash
    }
  } catch (e) {
    // Ignore invalid URL errors, might already be a relative path
  }
  return url
}

const link = getRoute(props.block.value.url)
const image = props.block.value.image

const getHeight = (w: number) => Math.round((w * ratio[0]) / ratio[1])

const ctaImageSize = Object.fromEntries(
  Object.entries(widthsObj).map(([k, w]) => [k, [w, getHeight(w)]])
) as Record<keyof typeof widthsObj, [number, number]>
</script>

<template>
  <VFlexibleLink :to="link" v-if="image && link">
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
