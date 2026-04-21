<script setup>
import { cmsSources } from "~/composables/globals.ts"
import { computed, onMounted, ref, watch } from "vue"
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
  // --- VImage-specific props (not passed to children) ---
  /** Image source - can be a string URL or object containing image data */
  src: { default: null, type: [Number, String, Object] },
  /** Fallback image URL to use if src fails to load */
  srcFallback: { default: null, type: String },
  /** Size configuration - can be array [width, height] or object with size properties */
  size: { type: [Array, Object], default: null },

  // --- Pass-through props (forwarded to child image components) ---
  alt: { default: "", type: String },
  allowPreview: { default: false, type: Boolean },
  allowVerticalEffect: { default: false, type: Boolean },
  density: { default: undefined, type: String },
  format: { default: undefined, type: String },
  height: { default: null, type: Number },
  isDecorative: { default: false, type: Boolean },
  loading: { default: "lazy", type: String },
  maxHeight: { default: Infinity, type: Number },
  maxWidth: { default: Infinity, type: Number },
  modifiers: { default: null, type: Object },
  quality: { default: undefined, type: Number },
  ratio: { default: null, type: Array },
  blindLoaderRatio: { default: [3, 2], type: Array },
  sizes: { default: undefined, type: String },
  srcset: { default: undefined, type: Array },
  to: { default: null, type: String },
  width: { default: null, type: Number },
})

const { getEpisodeFallBackImage } = useFallbackImages()

const finalSrcFallback = computed(() => {
  if (props.srcFallback) return props.srcFallback
  return getEpisodeFallBackImage()
})

// Loading state for the image
const imageLoaded = ref(false)
// Whether the image src failed to load (triggers fallback)
const imageErrored = ref(false)

// Track whether the component has mounted (client-side).
// Before mount (SSR + initial hydration), the image renders visible with no loader.
// After mount, the loader mechanism activates for CSR/app use.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

// emit image loaded event
const emit = defineEmits(["is-image-loaded"])

watch(imageLoaded, (newVal) => {
  if (newVal) {
    emit("is-image-loaded")
  }
})

const shouldShowLoader = computed(() => {
  // Don't show loader during SSR or before hydration completes.
  // Only activate after mount so the initial render matches on server and client.
  return mounted.value && !imageLoaded.value
})

// CSS class for the image wrapper — controls visibility of the child image
const imageVisibilityClass = computed(() => {
  // Before mount (SSR / hydration): always show image — no loader flicker
  if (!mounted.value) return "image-loaded"
  return imageLoaded.value ? "image-loaded" : "image-loading"
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

// Handle image error - swap to fallback src
// const handleImageError = () => {
//   if (!imageErrored.value) {
//     imageErrored.value = true
//     imageLoaded.value = false
//   }
// }

// // The src actually passed down to the sub-component
// const effectiveSrc = computed(() => {
//   return imageErrored.value ? finalSrcFallback.value : imageTemplate.value
// })

// Reset loading/error state when image source changes
watch(
  () => imageTemplate.value,
  () => {
    imageLoaded.value = false
    imageErrored.value = false
  }
)

// Computed style for loader dimensions to match image responsively
const loaderDimensions = computed(() => {
  // if using nuxt-img size prop for native ratio handling, we have to hard code the ratio in or the loader will use square defaults.
  if (props.sizes) {
    return `aspect-ratio:${props.blindLoaderRatio[0]} / ${props.blindLoaderRatio[1]};  width:100%; height:100%; max-width:100%; max-height:100%;`
  }

  // Use aspect-ratio and width: 100% to make it responsive like the images
  return `aspect-ratio: ${imageRatio.value[0]} / ${imageRatio.value[1]}; width:100%; height:100%; max-width:${imageRatio.value[0]}px; max-height:${imageRatio.value[1]}px;`
})

// Determines which component to render based on the CMS source — simple lookup, SSR-safe
const dynamicComponent = computed(() => {
  if (!cmsSource.value) return null
  return componentMap[cmsSource.value] ?? VImageWagtail
})

// Build a clean props object for the child — only pass defined props, not $attrs.
// This prevents stray attributes from leaking through to actual HTML elements.
const childProps = computed(() => {
  const p = {}

  // Pass-through props (only if defined/non-default, to let child defaults work)
  if (props.alt) p.alt = props.alt
  if (props.allowPreview) p.allowPreview = props.allowPreview
  if (props.allowVerticalEffect) p.allowVerticalEffect = props.allowVerticalEffect
  if (props.density !== undefined) p.density = props.density
  if (props.format !== undefined) p.format = props.format
  if (props.isDecorative) p.isDecorative = props.isDecorative
  if (props.loading !== "lazy") p.loading = props.loading
  if (props.maxHeight !== Infinity) p.maxHeight = props.maxHeight
  if (props.maxWidth !== Infinity) p.maxWidth = props.maxWidth
  if (props.modifiers) p.modifiers = props.modifiers
  if (props.quality !== undefined) p.quality = props.quality
  if (props.sizes !== undefined) p.sizes = props.sizes
  if (props.srcset !== undefined) p.srcset = props.srcset
  if (props.to) p.to = props.to

  // These are always passed, overridden by VImage's own computed values
  p.src = imageTemplate.value
  p.width = imageWidth.value
  p.height = imageHeight.value
  p.ratio = props.ratio?.length ? props.ratio : imageRatio.value

  return p
})
</script>

<template>
  <div class="v-image-wrapper">
    <!-- Wrapper controls image visibility — not on <component> since inheritAttrs:false prevents class fallthrough -->
    <div :class="imageVisibilityClass">
      <component
        :is="dynamicComponent"
        :key="imageTemplate"
        v-bind="childProps"
        @image-load="handleImageLoad"
      >
        <template v-for="(value, name) in $slots" #[name]="data">
          <slot :name="name" v-bind="data"></slot>
        </template>
      </component>
    </div>

    <!-- Loader container that holds space -->

    <div v-if="shouldShowLoader" class="image-loader-container" :style="loaderDimensions">
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
  .image-loading {
    position: absolute;
    top: 0;
    left: 0;
    height: 5px;
    opacity: 0;
    pointer-events: none;
  }

  .image-loaded {
    position: relative;
    opacity: 1;
    top: 0;
    left: 0;
  }
}
</style>
