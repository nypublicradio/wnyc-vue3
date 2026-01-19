<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import InertiaPlugin from "~/assets/gsap/InertiaPlugin.js"

// Register GSAP plugins
gsap.registerPlugin(Draggable, InertiaPlugin)

const props = defineProps({
  // How many items to show in viewport at once (e.g., 2.5 shows 2 full + half of next)
  itemsToShow: {
    type: Number,
    default: 3,
  },
  // Gap between items in pixels (M3 default: 8dp)
  gap: {
    type: Number,
    default: 8,
  },
  // Aspect ratio of items (width/height, e.g., 3/4 for portrait, 16/9 for landscape)
  itemAspectRatio: {
    type: Number,
    default: 3 / 4,
  },
  // Enable throw/swipe physics (GSAP Draggable with inertia)
  enableThrow: {
    type: Boolean,
    default: false,
  },
  // Apply gradient mask on left/right edges
  edgeFade: {
    type: Boolean,
    default: false,
  },
  // Width of edge fade gradient in pixels
  edgeFadeDistance: {
    type: Number,
    default: 32,
  },
  // Material Design scaling: controls the ratio between active and inactive slide sizes
  slideSplitRatio: {
    type: Number,
    default: 0.65,
    validator: (value) => value >= 0 && value <= 1,
  },
  // Enable Material Design carousel scaling behavior
  enableMaterialScaling: {
    type: Boolean,
    default: false,
  },
  // Minimum width for scaled items
  minItemWidth: {
    type: Number,
    default: 50,
  },
})

const carouselRef = ref(null)
const trackRef = ref(null)
const currentTranslate = ref(0)
const slideElements = ref([])
const slideProgress = ref([])
let draggableInstance = null

// Calculate item width based on how many items should be visible
const itemWidth = computed(() => {
  if (!carouselRef.value) return "100%"
  const containerWidth = carouselRef.value.offsetWidth
  const totalGapWidth = props.gap * (props.itemsToShow - 1)
  const availableWidth = containerWidth - totalGapWidth
  const width = availableWidth / props.itemsToShow
  return `${width}px`
})

// Calculate item height based on aspect ratio
const itemHeight = computed(() => {
  if (!carouselRef.value) return "auto"
  const containerWidth = carouselRef.value.offsetWidth
  const totalGapWidth = props.gap * (props.itemsToShow - 1)
  const availableWidth = containerWidth - totalGapWidth
  const width = availableWidth / props.itemsToShow
  const height = width / props.itemAspectRatio
  return `${height}px`
})

// Edge fade gradient mask style
const maskStyle = computed(() => {
  if (!props.edgeFade) return {}

  const fadeDistance = props.edgeFadeDistance
  return {
    maskImage: `linear-gradient(to right, 
      transparent 0, 
      black ${fadeDistance}px, 
      black calc(100% - ${fadeDistance}px), 
      transparent 100%)`,
    WebkitMaskImage: `linear-gradient(to right, 
      transparent 0, 
      black ${fadeDistance}px, 
      black calc(100% - ${fadeDistance}px), 
      transparent 100%)`,
  }
})

// Calculate slide progress for Material scaling
const updateSlideProgress = () => {
  if (!props.enableMaterialScaling || !trackRef.value) return

  const children = trackRef.value.children
  slideElements.value = Array.from(children)

  // Material Scaling Logic: Right-edge squish
  const track = trackRef.value
  // children is already defined above and assigned to slideElements.value
  const carouselWidth = carouselRef.value.offsetWidth
  const x = currentTranslate.value

  // 1. Calculate Native dimensions
  // We assume height is uniform, derived from the "standard" item set
  // For mixed aspect ratios, we use the data-aspect-ratio attribute or fall back to prop

  // Calculate standard item width just for height reference (N items fit in view)
  const totalGapWidth = props.gap * (props.itemsToShow - 1)
  const availableWidthForHeight = carouselWidth - totalGapWidth
  const standardWidth = availableWidthForHeight / props.itemsToShow
  const fixedHeight = standardWidth / props.itemAspectRatio

  let accumulatedWidth = 0

  slideElements.value.forEach((slide) => {
    // Determine Native Width
    let nativeWidth = standardWidth
    if (slide.dataset.aspectRatio) {
      nativeWidth = fixedHeight * parseFloat(slide.dataset.aspectRatio)
    }

    // 2. Algorithm: "Waterfill" from Left to Right
    // Determine position relative to viewport
    // Since we are applying widths dynamically, Flexbox/Layout will shift valid starting positions
    // We must track the 'virtual' position based on accumulated dynamic widths

    // Position of this item in the 'track' (relative to track start)
    const leftPos = accumulatedWidth

    // Position relative to Viewport Left
    const visualLeft = leftPos + x

    // Calculate Available Space from this item's start to the Viewport Right Edge
    const availableSpace = carouselWidth - visualLeft

    // Target Width: Native, but capped by Available Space (and Min Width)
    // - If item is fully comfortably inside, availableSpace >> nativeWidth -> Width = Native.
    // - If item is near right edge, availableSpace < nativeWidth -> Width = availableSpace.
    // - If availableSpace is very small (or negative), clamp to minItemWidth.

    let targetWidth = Math.min(nativeWidth, availableSpace)
    targetWidth = Math.max(targetWidth, props.minItemWidth)

    // Edge case: If item is far right (offscreen), it stays minWidth (or 0?)
    // User wants "scale down the last item(s) to fit".
    // This logic creates a "Right Wall".

    // Apply Width
    slide.style.width = `${targetWidth}px`
    slide.style.height = `${fixedHeight}px` // Ensure height is explicit
    slide.style.flex = `0 0 ${targetWidth}px` // Update flex-basis to be sure

    // Removed CSS transition to ensure 1:1 sync with scroll physics
    slide.style.transition = "none"

    // Accumulate actual used width for the next item
    accumulatedWidth += targetWidth + props.gap
  })

  // Update track width explicitly?
  // Flexbox handles the total width, but GSAP Draggable needs to know the bounds.
  // Draggable bounds usually rely on scrollWidth.
  // If we change widths, scrollWidth changes.
  // We might need to refresh Draggable bounds if the total width changes significantly?
  // But forcing 'x' is safe.
}

// Helper (Unused now, logic moved to updateSlideProgress for integrated flow)
const getSlideScale = (index) => {
  return 1
}

// Get dynamic width for a slide
const getSlideWidth = (index) => {
  if (!props.enableMaterialScaling) return itemWidth.value

  const scale = getSlideScale(index)
  const itemWidthNum = parseFloat(itemWidth.value)
  return `${itemWidthNum * scale}px`
}

// Initialize GSAP Draggable for throw physics
const initDraggable = () => {
  if (!props.enableThrow || !trackRef.value) return

  // Clean up existing instance
  if (draggableInstance) {
    draggableInstance[0].kill()
    draggableInstance = null
  }

  // Get track and item dimensions
  const track = trackRef.value
  const items = Array.from(track.children)
  if (!items.length) return

  // Calculate Theoretical Total Width (All items at Native Width)
  // This is required because offscreen items are currently "squished" to minWidth,
  // making track.scrollWidth inaccurately small for the full scroll range.

  const containerWidth = carouselRef.value.offsetWidth

  // Calculate standard metrics (reusing logic from updateSlideProgress)
  // Note: Ideally these shared metrics would be computed properties/composables
  const totalGapWidth = props.gap * (props.itemsToShow - 1)
  const availableWidthForHeight = containerWidth - totalGapWidth
  const standardWidth = availableWidthForHeight / props.itemsToShow
  const fixedHeight = standardWidth / props.itemAspectRatio

  let totalNativeWidth = 0
  items.forEach((slide, index) => {
    let nativeWidth = standardWidth
    if (slide.dataset.aspectRatio) {
      nativeWidth = fixedHeight * parseFloat(slide.dataset.aspectRatio)
    }
    totalNativeWidth += nativeWidth

    // Add gap for all except last
    if (index < items.length - 1) {
      totalNativeWidth += props.gap
    }
  })

  // Calculate scroll bounds based on FULL theoretical width
  const maxScroll = -(totalNativeWidth - containerWidth)
  // Safety check: if content fits in container, maxScroll might be positive -> clamp to 0
  const actualMaxScroll = Math.min(maxScroll, 0)

  draggableInstance = Draggable.create(track, {
    type: "x",
    bounds: {
      minX: actualMaxScroll,
      maxX: 0,
    },
    inertia: true,
    throwProps: true,
    edgeResistance: 0.65,
    // Snap to item positions?
    // Variable width snapping is complex.
    // For now, removing snap or using a generic approach might be safer with mixed widths.
    // The previous snap logic assumed fixed widths:
    // snap: (value) => ...
    // With mixed widths, we'd need to calculate closest snap point dynamically.
    // Let's Dsiable snap for now to prevent erratic jumping, or we can implement smart snap later.
    // snap: ... (removed for mixed width support)

    onDrag: function () {
      currentTranslate.value = this.x
      updateSlideProgress()
      // GSAP Draggable auto-applies transform to target (track)
      // BUT updateSlideProgress ALSO affects layout.
      // We rely on Draggable to handle the 'x'.
    },
    onThrowUpdate: function () {
      currentTranslate.value = this.x
      updateSlideProgress()
    },
  })
}

// Watch for changes that require re-initialization
watch(
  () => props.enableThrow,
  () => {
    if (props.enableThrow) {
      initDraggable()
    } else if (draggableInstance) {
      draggableInstance[0].kill()
      draggableInstance = null
      // Reset transform
      gsap.set(trackRef.value, { x: 0 })
    }
  }
)

onMounted(() => {
  initDraggable()
  // Initial calculation
  requestAnimationFrame(() => {
    updateSlideProgress()
  })

  window.addEventListener("resize", onResize)
})

onUnmounted(() => {
  if (draggableInstance) {
    draggableInstance[0].kill()
  }
  window.removeEventListener("resize", onResize)
  clearTimeout(resizeTimeout)
})
</script>

<template>
  <div
    class="material-carousel"
    ref="carouselRef"
    :style="maskStyle"
    role="region"
    aria-label="carousel"
  >
    <div
      class="carousel-track"
      ref="trackRef"
      :class="{
        'scroll-snap': !enableThrow,
        draggable: enableThrow,
        'material-scaling': enableMaterialScaling,
      }"
      :style="{
        gap: `${gap}px`,
        '--item-width': itemWidth,
        '--item-height': itemHeight,
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.material-carousel {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.carousel-track {
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  // Native scroll for non-throw mode
  &.scroll-snap {
    overflow-x: auto;
    overflow-y: hidden;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;

    // Hide scrollbar
    scrollbar-width: none;
    &::-webkit-scrollbar {
      display: none;
    }
  }

  // GSAP draggable mode
  &.draggable {
    overflow: visible;
    cursor: grab;
    will-change: transform;

    &:active {
      cursor: grabbing;
    }
  }
}

// Style slotted items using deep selector
.carousel-track :deep(> *) {
  flex: 0 0 auto;
  width: var(--item-width);
  height: var(--item-height);
  scroll-snap-align: start;
  box-sizing: border-box;

  // Ensure content fills the item
  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}
</style>
