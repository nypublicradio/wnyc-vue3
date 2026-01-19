<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import InertiaPlugin from "~/assets/gsap/InertiaPlugin.js"

// Register GSAP plugins
gsap.registerPlugin(Draggable, InertiaPlugin)

const props = defineProps({
  // Gap between items in pixels (M3 default: 8dp)
  gap: {
    type: Number,
    default: 8,
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
})

const carouselRef = ref(null)
const trackRef = ref(null)
const currentTranslate = ref(0)
const slideElements = ref([])
const slideProgress = ref([])
let draggableInstance = null

const containerWidth = ref(0)
let resizeObserver = null

const itemNativeDimensions = ref([])

// Edge fade gradient mask style

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

const contentResizeObserver = ref(null)
const isInteracting = ref(false) // True during entire drag + throw sequence
let throwUpdateRAF = null

// Measure natural dimensions of items
const measureItems = () => {
  if (!trackRef.value) return
  if (isInteracting.value) return // Don't re-measure during drag/throw

  const children = Array.from(trackRef.value.children)
  if (!children.length) return

  // 1. Reset Reset styles to get natural size
  // CRITICAL: We must reset the parent slide constraints so the child (MediaCard)
  // can expand to its natural 'min-content' width.
  children.forEach((slide) => {
    slide.style.width = ""
    slide.style.maxWidth = "" // CRITICAL: Clear this so it doesn't constrain next measure
    slide.style.flex = "0 0 auto"
    slide.style.marginLeft = ""
    // slide.style.height = "" // Height is usually consistent, but could reset too

    // CRITICAL: Also clear the content constraints we applied (pinning)
    const content = slide.firstElementChild
    if (content) {
      content.style.width = ""
      content.style.minWidth = ""
      content.style.transform = ""
    }
  })

  // 2. Measure
  itemNativeDimensions.value = children.map((slide) => {
    // Measure the slide itself now that it's unconstrained (auto width)
    // We prefer the first child's scrollWidth or offsetWidth to get the "Content" size
    const content = slide.firstElementChild
    return {
      width: content ? content.offsetWidth : slide.offsetWidth,
      height: slide.offsetHeight,
    }
  })

  // After measurement, we must re-run the layout logic
  updateSlideProgress()
  initDraggable() // Re-calculate bounds and draggable instance
}

// Observe content changes (image loads, etc)
const setupContentObserver = () => {
  if (!trackRef.value) return

  // Create observer if not exists
  if (!contentResizeObserver.value) {
    contentResizeObserver.value = new ResizeObserver((entries) => {
      // Don't interfere with active drag/throw operations
      if (isInteracting.value) return

      // Check if any significant change?
      // For now, just re-measure all
      measureItems()
      updateSlideProgress()
      initDraggable() // Re-calc bounds
    })
  }

  // Observe all children's content
  // Observe all children's CONTENT (Images)
  // We avoid observing the slide/card wrapper itself because it resizes during the drag effect (feedback loop).
  // The image inside MediaCard2 has 'width: auto', so it should maintain natural size.
  const children = Array.from(trackRef.value.children)
  children.forEach((slide) => {
    // Look for image inside
    const img = slide.querySelector("img")
    if (img) {
      contentResizeObserver.value.observe(img)
    } else {
      // Fallback if no image? Observe first child but be careful
      // If content is text-only, it might resizing.
      // For now, optimize for MediaCard with images.
      const content = slide.firstElementChild
      if (content) contentResizeObserver.value.observe(content)
    }
  })
}

// Calculate slide progress for Material scaling
const updateSlideProgress = () => {
  if (
    !props.enableMaterialScaling ||
    !trackRef.value ||
    !itemNativeDimensions.value.length
  )
    return

  const children = trackRef.value.children
  slideElements.value = Array.from(children)

  // Use reactive container width
  const currentWidth = containerWidth.value
  if (!currentWidth) return

  const x = currentTranslate.value

  let accumulatedWidth = 0

  slideElements.value.forEach((slide, index) => {
    // Determine Native Width from measurements
    const dims = itemNativeDimensions.value[index]
    if (!dims) return

    let nativeWidth = dims.width
    let nativeHeight = dims.height

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

    // Apply Styles - Use max-width to allow squishing
    slide.style.width = "100%"
    slide.style.maxWidth = `${targetWidth}px`
    slide.style.height = `${nativeHeight}px`
    slide.style.flex = `0 0 ${targetWidth}px`
    slide.style.marginLeft = `${marginLeft}px`
    // Only disable transitions when not interacting (preserve throw smoothness)
    if (!isInteracting.value) {
      slide.style.transition = "none"
    }

    // No need for translateX anymore - content scales naturally via max-width: 100%
    // The slide's overflow: hidden handles clipping, marginLeft handles positioning

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

  // Calculate Theoretical Total Width (All items at Native Width)
  const currentWidth = containerWidth.value
  if (!currentWidth) return

  let totalNativeWidth = 0
  items.forEach((slide, index) => {
    // Get stored dimensions
    const dims = itemNativeDimensions.value[index]
    const nativeWidth = dims ? dims.width : 0

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

    // Interaction starts when drag begins
    onDragStart: function () {
      isInteracting.value = true
    },
    onDrag: function () {
      currentTranslate.value = this.x
      updateSlideProgress()
    },
    // Drag ends but throw might be starting
    onDragEnd: function () {
      // If no throw is happening, interaction is done
      if (!this.isThrowing) {
        isInteracting.value = false
      }
      // Otherwise keep isInteracting true through the throw
    },
    onThrowUpdate: function () {
      currentTranslate.value = this.x
      // Use RAF to batch updates during throw - prevents layout thrashing
      if (!throwUpdateRAF) {
        throwUpdateRAF = requestAnimationFrame(() => {
          updateSlideProgress()
          throwUpdateRAF = null
        })
      }
    },
    // Interaction ends when throw completes
    onThrowComplete: function () {
      isInteracting.value = false
      if (throwUpdateRAF) {
        cancelAnimationFrame(throwUpdateRAF)
        throwUpdateRAF = null
      }
      // Final update to ensure correct state
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
    // Re-measure content
    measureItems()

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
  // Wait for content to render?
  // Initial init
  // Wait for content to render?
  requestAnimationFrame(() => {
    setupContentObserver() // Start observing content
    measureItems() // This will trigger updateSlideProgress and initDraggable

    // Also re-measure after a short delay to catch any late-loading images
    setTimeout(() => {
      measureItems()
    }, 100)
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
  if (contentResizeObserver.value) {
    contentResizeObserver.value.disconnect()
  }
  clearTimeout(resizeTimeout)
})
</script>

<template>
  <div
    class="material-carousel-advanced"
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
      }"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.material-carousel-advanced {
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
  width: auto; // Default to auto, overridden by JS logic
  height: auto;
  scroll-snap-align: start;
  box-sizing: border-box;
  overflow: hidden; /* Needed for cropping/squish effect */

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
