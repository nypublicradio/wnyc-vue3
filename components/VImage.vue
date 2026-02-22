<script setup>
import { cmsSources } from "~/composables/globals.ts"
import { getEpisodeFallBackImage } from "~/utilities/helpers"
import { computed, defineAsyncComponent, markRaw, ref, watch } from "vue"
import { useVImageDimensions } from "~/composables/useVImageDimensions"
import { useVImage } from "~/composables/useVImage"

// Cache components to avoid recreation
const componentCache = new Map()

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

// determines what component to load based on the item type
const dynamicComponent = computed(() => {
  if (!cmsSource.value) return null

  const source = cmsSource.value

  // Check if we already have this component cached
  if (componentCache.has(source)) {
    return componentCache.get(source)
  }

  // Get the import function based on CMS source
  const getComponentImport = () => {
    switch (source) {
      case cmsSources.PUBLISHER:
        return () => import("./VImagePublisher.vue")
      case cmsSources.NPR:
        return () => import("./VImageNpr.vue")
      case cmsSources.WAGTAIL:
        return () => import("./VImageWagtail.vue")
      case cmsSources.SIMPLECAST:
        return () => import("./VImageWagtail.vue")
      default:
        return () => import("./VImageWagtail.vue")
    }
  }

  const component = markRaw(
    defineAsyncComponent({
      loader: getComponentImport(),
      onError: (err) => {
        console.error(`Failed to load component: ${err.message}`)
      },
    })
  )

  // Store in cache for next time
  componentCache.set(source, component)
  return component
})
</script>

<template>
  <div class="v-image-wrapper">
    <!-- Image component positioned absolutely when loading -->
    <component
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

    <!-- Loader container that holds space -->
    <div
      v-if="shouldShowLoader"
      class="image-loader-container"
      :style="loaderDimensions"
    >
      <WnycLoader class="image-loader-anim" size="1rem" bg spinner />
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
