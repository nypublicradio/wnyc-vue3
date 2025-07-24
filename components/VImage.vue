<script setup>
import { cmsSources } from "~/composables/globals.ts"
import { getEpisodeFallBackImage } from "~/utilities/helpers"
import { computed, defineAsyncComponent, markRaw, ref, watch } from "vue"
import { useVImageDimensions } from "~/composables/useVImageDimensions"
import { useVImage } from "~/composables/useVImage"

const props = defineProps({
  /** Image source - can be a string URL or object containing image data */
  src: {
    default: null,
    type: [String, Object],
  },
  /** Fallback image URL to use if src fails to load */
  srcFallback: {
    default: getEpisodeFallBackImage(),
    type: String,
  },
  /** Size configuration - can be array [width, height] or object with size properties */
  size: {
    type: [Array, Object],
    default: null,
  },
})

const route = useRoute()

// Loading state for the image
const imageLoaded = ref(false)
// Check if the current route/page is being served from cache
const isFromCache = computed(() => {
  // Check Nuxt's cache headers or meta
  return (
    route.meta?.cached ||
    (import.meta.client && document.querySelector('meta[name="nuxt-cache"]'))
  )
})

const shouldShowLoader = computed(() => {
  return !imageLoaded.value && !isFromCache.value
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
  return getCmsSourceAndImageTemplate(props.src, props.srcFallback)
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
  return `aspect-ratio: ${imageRatio.value[0]} / ${imageRatio.value[1]}; width:100%`
})

// determines what component to load based on the item type
const dynamicComponent = computed(() => {
  if (!cmsSource.value) return null

  // Get the import function based on CMS source
  const getComponentImport = () => {
    switch (cmsSource.value) {
      case cmsSources.PUBLISHER:
        return () => import("./VImagePublisher.vue")
      case cmsSources.NPR:
        return () => import("./VImageNpr.vue")
      case cmsSources.WAGTAIL:
        return () => import("./VImageWagtail.vue")
      default:
        return () => import("./VImageWagtail.vue")
    }
  }

  return markRaw(
    defineAsyncComponent({
      loader: getComponentImport(),
      onError: (err) => {
        console.error(`Failed to load component: ${err.message}`)
      },
    })
  )
})
</script>

<template>
  <div class="v-image-wrapper">
    <!-- Loader container that holds space -->
    <div v-if="shouldShowLoader" class="image-loader-container" :style="loaderDimensions">
      <WnycLoader class="image-loader-anim" size="1rem" bg spinner />
    </div>
    <!-- Image component positioned absolutely when loading -->
    <component
      v-if="cmsSource && dynamicComponent"
      :is="dynamicComponent"
      :key="`${cmsSource}-${imageTemplate}`"
      v-bind="{ ...$props, ...$attrs }"
      :src="imageTemplate"
      :width="props.width || imageWidth"
      :height="props.height || imageHeight"
      :ratio="props.ratio || imageRatio"
      :class="{ 'image-loading': !imageLoaded, 'image-loaded': imageLoaded }"
      @image-load="handleImageLoad"
    >
      <template v-for="(value, name) in $slots" #[name]="data">
        <slot :name="name" v-bind="data"></slot>
      </template>
    </component>
  </div>
</template>

<style lang="scss" scoped>
.v-image-wrapper {
  position: relative;
  line-height: 0;
  height: inherit;

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
  :deep(.v-image),
  :deep(.v-image-wagtail),
  :deep(.v-image-publisher),
  :deep(.v-image-npr) {
    transition: opacity 0.2s ease-in-out;

    &.image-loading {
      position: absolute;
      top: 0;
      left: 0;
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
