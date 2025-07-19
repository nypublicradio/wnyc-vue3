<script setup>
import VImageNpr from "./VImageNpr.vue"
import VImagePublisher from "./VImagePublisher.vue"
import VImageWagtail from "./VImageWagtail.vue"
import { cmsSources } from "~/composables/globals.ts"
import {
  getCmsSourceAndImageTemplate,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"
import { ref, watch } from "vue"
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

const imgSrc = ref(getCmsSourceAndImageTemplate(props.src, props.srcFallback))
// Watch the 'src' prop for changes and update 'cmsSource' accordingly
watch(
  () => props.src,
  (newSrc) => {
    imgSrc.value = getCmsSourceAndImageTemplate(newSrc, props.srcFallback)
  }
)
</script>

<template>
  <VImagePublisher
    v-if="imgSrc.cmsSource === cmsSources.PUBLISHER"
    :key="`${props.src}Publisher`"
    v-bind="{ ...$props, ...$attrs }"
    :src="imgSrc.imageTemplate"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImagePublisher>
  <VImageNpr
    v-else-if="imgSrc.cmsSource === cmsSources.NPR"
    :key="`${props.src}Npr`"
    v-bind="{ ...$props, ...$attrs }"
    :src="imgSrc.imageTemplate"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImageNpr>
  <VImageWagtail
    v-else-if="imgSrc.cmsSource === cmsSources.WAGTAIL"
    :key="`${props.src}Wagtail`"
    v-bind="{ ...$props, ...$attrs }"
    :src="imgSrc.imageTemplate"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImageWagtail>
</template>
