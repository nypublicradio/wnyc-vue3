<script setup>
import VImageNpr from "./VImageNpr.vue"
import VImagePublisher from "./VImagePublisher.vue"
import VImageWagtail from "./VImageWagtail.vue"
import { cmsSources } from "~/composables/globals.ts"
import {
  getCmsSourceAndImageTemplate,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"
import { computed } from "vue"
import { useImageDimensions } from "~/composables/useImageDimensions"
const props = defineProps({
  src: {
    default: null,
    type: [String, Object],
  },
  srcFallback: {
    default: getEpisodeFallBackImage(),
    type: String,
  },
  size: {
    type: [Array, Object],
    default: null,
  },
})

// Use the simplified image dimensions composable
const { width: imageWidth, height: imageHeight } = useImageDimensions({
  size: props.size,
})

// Computed ratio for VImage compatibility - derived from current dimensions
const imageRatio = computed(() => {
  return [imageWidth.value, imageHeight.value]
})

// Single computed property that handles all the reactive logic
const imgData = computed(() => {
  return getCmsSourceAndImageTemplate(props.src, props.srcFallback)
})

// Individual computed properties for easier access
const cmsSource = computed(() => imgData.value.cmsSource)
const imageTemplate = computed(() => imgData.value.imageTemplate)
</script>

<template>
  <VImagePublisher
    v-if="cmsSource === cmsSources.PUBLISHER"
    :key="`publisher-${imageTemplate}`"
    v-bind="{ ...$props, ...$attrs }"
    :src="imageTemplate"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImagePublisher>
  <VImageNpr
    v-else-if="cmsSource === cmsSources.NPR"
    :key="`npr-${imageTemplate}`"
    v-bind="{ ...$props, ...$attrs }"
    :src="imageTemplate"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImageNpr>
  <VImageWagtail
    v-else-if="cmsSource === cmsSources.WAGTAIL"
    :key="`wagtail-${imageTemplate}`"
    v-bind="{ ...$props, ...$attrs }"
    :src="imageTemplate"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImageWagtail>
</template>
