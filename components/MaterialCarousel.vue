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
  // Minimum width for scaled items (Material Scaling "squish" limit)
  minItemWidth: {
    type: Number,
    default: 50,
  },
  // Minimum height for items
  minItemHeight: {
    type: Number,
    default: 0,
  },
  // Maximum height for items
  maxItemHeight: {
    type: Number,
    default: Infinity,
  },
})

const carouselRef = ref(null)
const trackRef = ref(null)
const currentTranslate = ref(0)
const slideElements = ref([])
const slideProgress = ref([])
let draggableInstance = null

const containerWidth = ref(0)
let resizeObserver = null

// Helper to calculate standard dimensions based on container width
const getStandardDimensions = (width) => {
  if (!width) return { width: 0, height: 0 }

  const totalGapWidth = props.gap * (props.itemsToShow - 1)
  const availableWidth = width - totalGapWidth
  const rawWidth = availableWidth / props.itemsToShow
  const rawHeight = rawWidth / props.itemAspectRatio

  // Apply height clamps
  const height = Math.min(
    Math.max(rawHeight, props.minItemHeight),
    props.maxItemHeight
  )
  const finalWidth = height * props.itemAspectRatio

  return { width: finalWidth, height }
}

// Calculate item width based on how many items should be visible
const itemWidth = computed(() => {
  const { width } = getStandardDimensions(containerWidth.value)
  return `${width}px`
})

// Calculate item height based on aspect ratio
const itemHeight = computed(() => {
  const { height } = getStandardDimensions(containerWidth.value)
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

  // Use reactive container width
  const currentWidth = containerWidth.value
  if (!currentWidth) return

  const x = currentTranslate.value

  // 1. Calculate dimensions using helper
  const { width: standardWidth, height: fixedHeight } =
    getStandardDimensions(currentWidth)

  let accumulatedWidth = 0

  slideElements.value.forEach((slide) => {
    // Determine Native Width
    let nativeWidth = standardWidth
    if (slide.dataset.aspectRatio) {
      nativeWidth = fixedHeight * parseFloat(slide.dataset.aspectRatio)
    }

    // 2. Algorithm: "Waterfill" from Left to Right
    // Determine position relative to viewport
    const leftPos = accumulatedWidth
    const visualLeft = leftPos + x

    // Calculate space from Left and Right of viewport
    const availableSpaceRight = currentWidth - visualLeft
    const availableSpaceLeft = visualLeft + nativeWidth // How much of the item is past the left edge (0) to its own right edge?

    // Target Width: Native, but capped by Available Space (and Min Width)
    // - Right side: availableSpaceRight < nativeWidth -> scale down.
    // - Left side: availableSpaceLeft < nativeWidth -> scale down.

    let targetWidth = nativeWidth

    // Check constraints
    if (visualLeft > 0) {
      // Normal or Right side
      targetWidth = Math.min(targetWidth, availableSpaceRight)
    } else {
      // Left side interaction (visualLeft <= 0)
      targetWidth = Math.min(targetWidth, availableSpaceLeft)
    }

    targetWidth = Math.max(targetWidth, props.minItemWidth)

    // Calculate Padding/Margin Compensation for Left Side
    // If we are on the left side, AND we are squished (width < native),
    // we must push the element right (via margin-left) by the amount "lost".
    // This keeps the visually rendered left edge pinned to 0 (or wherever it settled).

    let marginLeft = 0
    if (visualLeft <= 0) {
      // We are potentially squishing on the left.
      // The amount we ideally wanted was nativeWidth.
      // The amount we got is targetWidth.
      // The difference is what we chopped off the left.
      const lostWidth = nativeWidth - targetWidth
      // Apply only if valid positive number
      if (lostWidth > 0) {
        marginLeft = lostWidth
      }
    }

    // Apply Styles
    slide.style.width = `${targetWidth}px`
    slide.style.height = `${fixedHeight}px`
    slide.style.flex = `0 0 ${targetWidth}px`
    slide.style.marginLeft = `${marginLeft}px`

    slide.style.transition = "none"

    // Accumulate for next item
    // IMPORTANT: The flow position should assume the item took up its full NATIVE space.
    // If we reduced width by 50 but added margin 50, the total footprint is 100% native.
    // This ensures subsequent items don't jump around.

    accumulatedWidth += targetWidth + marginLeft + props.gap
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

  const currentWidth = containerWidth.value
  if (!currentWidth) return

  // Calculate standard metrics using helper
  const { width: standardWidth, height: fixedHeight } =
    getStandardDimensions(currentWidth)

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
  const maxScroll = -(totalNativeWidth - currentWidth)
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

// Handle resize
let resizeTimeout
const onResize = () => {
  // Simple debounce
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    // Re-run logic
    updateSlideProgress()

    // Re-init Draggable to update bounds
    // We need to ensure we keep the current position if valid, or clamp if out of bounds
    initDraggable()

    // Explicitly apply bounds enforcement?
    // Draggable.create doesn't auto-snap to bounds immediately if we just created it.
    // We might need to check if current x is out of bounds.
    if (draggableInstance && draggableInstance[0]) {
      draggableInstance[0].applyBounds()
    }
  }, 100)
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

let observer = null

onMounted(() => {
  // Setup ResizeObserver for container
  if (carouselRef.value) {
    // Initialize width immediately if possible
    containerWidth.value = carouselRef.value.offsetWidth

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Use contentRect.width
        containerWidth.value = entry.contentRect.width
        onResize()
      }
    })
    resizeObserver.observe(carouselRef.value)
  }

  // Observe track for added/removed items (async content)
  if (trackRef.value) {
    observer = new MutationObserver(() => {
      onResize()
    })
    observer.observe(trackRef.value, { childList: true })
  }

  // Initial init
  initDraggable()
  requestAnimationFrame(() => {
    updateSlideProgress()
  })
})

onUnmounted(() => {
  if (draggableInstance) {
    draggableInstance[0].kill()
  }
  if (observer) {
    observer.disconnect()
  }
  if (resizeObserver) {
    resizeObserver.disconnect()
  }
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
