<script setup>
import VImageNpr from "./VImageNpr.vue"
import VImagePublisher from "./VImagePublisher.vue"
import VImageWagtail from "./VImageWagtail.vue"
import { cmsSources } from "~/composables/globals.ts"
import { ref, watch } from "vue"
import { useImageDimensions } from "~/composables/useImageDimensions"
const props = defineProps({
  src: {
    default: null,
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

const NPRIMAGEDOMAINSOURCES = ["media.npr.org", "npr.brightspotcdn.com"]

// determines the CMS source of an image
const getCmsSource = (src) => {
  // if src is all just numbers, it's a wagtail image. using the domain for the others
  if (/^\d+$/.test(src)) {
    return cmsSources.WAGTAIL
  } else if (src.includes("media.wnyc.org")) {
    return cmsSources.PUBLISHER
  } else if (NPRIMAGEDOMAINSOURCES.some((domain) => src.includes(domain))) {
    return cmsSources.NPR
  } else {
    return cmsSources.WAGTAIL
  }
}

const cmsSource = ref(getCmsSource(props.src))

// Watch the 'src' prop for changes and update 'cmsSource' accordingly
watch(
  () => props.src,
  (newSrc) => {
    cmsSource.value = getCmsSource(newSrc)
  }
)
</script>

<template>
  <VImagePublisher
    v-if="cmsSource === cmsSources.PUBLISHER"
    :key="`${props.src}Publisher`"
    v-bind="{ ...$props, ...$attrs }"
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
    :key="`${props.src}Npr`"
    v-bind="{ ...$props, ...$attrs }"
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
    :key="`${props.src}Wagtail`"
    v-bind="{ ...$props, ...$attrs }"
    :width="props.width || imageWidth"
    :height="props.height || imageHeight"
    :ratio="props.ratio || imageRatio"
  >
    <template v-for="(value, name) in $slots" #[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>
  </VImageWagtail>
</template>
