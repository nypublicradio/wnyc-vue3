<script setup>
import { cmsSources } from "~/composables/globals.ts"
import { computed, ref, watch } from "vue"
import { useVImageDimensions } from "~/composables/useVImageDimensions"
import { useVImage } from "~/composables/useVImage"
import { useFallbackImages } from "~/composables/useFallbackImages"
import VImagePublisher from "./VImagePublisher.vue"
import VImageNpr from "./VImageNpr.vue"
import VImageWagtail from "./VImageWagtail.vue"

// Static component map — no module-level mutable state, SSR-safe
const componentMap = {
  [cmsSources.PUBLISHER]: VImagePublisher,
  [cmsSources.NPR]: VImageNpr,
  [cmsSources.WAGTAIL]: VImageWagtail,
  [cmsSources.SIMPLECAST]: VImageWagtail,
}

const props = defineProps({
  /** Image source - can be a string URL or object containing image data */
  src: {
    default: null,
    type: [Number, String, Object],
  },
  /** Fallback image URL to use if src fails to load */
  srcFallback: {
    default: null,
    type: String,
  },
  /** Size configuration - can be array [width, height] or object with size properties */
  size: {
    type: [Array, Object],
    default: null,
  },
})

const { getEpisodeFallBackImage } = useFallbackImages()

const finalSrcFallback = computed(() => {
  if (props.srcFallback) return props.srcFallback
  return getEpisodeFallBackImage()
})

// Loading state for the image
const imageLoaded = ref(false)

// emit image loaded event
const emit = defineEmits(["is-image-loaded"])

watch(imageLoaded, (newVal) => {
  if (newVal) {
    emit("is-image-loaded")
  }
})

const shouldShowLoader = computed(() => {
  return !imageLoaded.value
})

// Use the simplified image dimensions composable
const { width: imageWidth, height: imageHeight } = useVImageDimensions({
  size: props.size,
})
const { getCmsSourceAndImageTemplate } = useVImage()

// Computed ratio for VImage compatibility - derived from current dimensions
const imageRatio = computed(() => {
  return [imageWidth.value, imageHeight.value]
})

// Single computed property that handles all the reactive logic
const imgData = computed(() => {
  return getCmsSourceAndImageTemplate(props.src, finalSrcFallback.value)
})

// Individual computed properties for easier access
const cmsSource = computed(() => imgData.value.cmsSource)
const imageTemplate = computed(() => imgData.value.imageTemplate)

// Handle image load event
const handleImageLoad = () => {
  imageLoaded.value = true
}

// Reset loading state when image source changes
watch(
  () => imageTemplate.value,
  () => {
    imageLoaded.value = false
  }
)

// Computed style for loader dimensions to match image responsively
const loaderDimensions = computed(() => {
  // Use aspect-ratio and width: 100% to make it responsive like the images
  return `aspect-ratio: ${imageRatio.value[0]} / ${imageRatio.value[1]}; width:100%; height:100%; max-width:${imageRatio.value[0]}px; max-height:${imageRatio.value[1]}px;`
})

// Determines which component to render based on the CMS source — simple lookup, SSR-safe
const dynamicComponent = computed(() => {
  if (!cmsSource.value) return null
  return componentMap[cmsSource.value] ?? VImageWagtail
})
</script>

<template>
  <div class="v-image-wrapper">
    <!-- Image component positioned absolutely when loading -->
    <component
      :is="dynamicComponent"
      v-bind="{ ...$props, ...$attrs }"
      :src="imageTemplate"
      :width="imageWidth"
      :height="imageHeight"
      :ratio="imageRatio"
      :class="{ 'image-loading': !imageLoaded, 'image-loaded': imageLoaded }"
      @image-load="handleImageLoad"
    >
      <template v-for="(value, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </component>

    <!-- Loader container that holds space -->
    <div
      v-if="shouldShowLoader"
      class="image-loader-container"
      :style="loaderDimensions"
    >
      <ClientOnly>
        <WnycLoader class="image-loader-anim" size="1rem" bg spinner />
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.v-image-wrapper {
  position: relative;
  line-height: 0;
  height: inherit;
  width: 100%;

  .image-loader-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    /* Dimensions are set via inline styles to match image component */

    .image-loader-anim {
      z-index: 3;
    }
  }

  // Image positioning and transitions
  .v-image {
    &.image-loading {
      position: absolute;
      top: 0;
      left: 0;
      height: 5px;
      opacity: 0;
      pointer-events: none;
    }

    &.image-loaded {
      position: relative;
      opacity: 1;
      top: 0;
      left: 0;
    }
  }
}
</style>
