<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue"

const props = defineProps({
  // Gap between items in pixels (M3 default: 8dp)
  gap: {
    type: Number,
    default: 8,
  },
  // Apply gradient mask on left/right edges
  edgeFade: {
    type: Boolean,
    default: true,
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
    default: 0,
  },
  // Minimum width for content items (not directly used for logic but good for docs)
  minContentWidth: {
    type: Number,
    default: 0,
  },
})

const carouselRef = ref(null)
const trackRef = ref(null)
const currentScrollLeft = ref(0)
const maxScrollLeft = ref(0)
const containerWidth = ref(0)
const itemNativeDimensions = ref([])
const showLeftArrow = ref(false)
const showRightArrow = ref(true)

// Resize observing
let resizeObserver = null
let contentResizeObserver = null
// Optimization: Cache slide elements
const cachedSlides = ref([])
// Optimization: Dirty check map
const styleCache = new WeakMap()

// Edge fade gradient mask style - Dynamic based on scroll position
const maskStyle = computed(() => {
  if (!props.edgeFade) return {}

  const fadeDistance = props.edgeFadeDistance
  const isStart = currentScrollLeft.value <= 5 // Tolerance
  const isEnd = currentScrollLeft.value >= maxScrollLeft.value - 5 // Tolerance

  let maskString = ""

  if (isStart && isEnd) {
    // Content fits, no mask needed usually, or full visibility
    return {}
  } else if (isStart) {
    // Only right mask
    maskString = `linear-gradient(to right, black calc(100% - ${fadeDistance}px), transparent 100%)`
  } else if (isEnd) {
    // Only left mask
    maskString = `linear-gradient(to right, transparent 0, black ${fadeDistance}px)`
  } else {
    // Both masks
    maskString = `linear-gradient(to right, transparent 0, black ${fadeDistance}px, black calc(100% - ${fadeDistance}px), transparent 100%)`
  }

  return {
    maskImage: maskString,
    WebkitMaskImage: maskString,
  }
})

// Scroll Handler
const onScroll = () => {
  if (!trackRef.value) return
  currentScrollLeft.value = trackRef.value.scrollLeft

  // Update Arrow State
  showLeftArrow.value = currentScrollLeft.value > 5
  // Allowing a small buffer for float precision
  showRightArrow.value = currentScrollLeft.value < maxScrollLeft.value - 5

  // Run Material Scaling
  updateSlideProgress()
}

// Navigation Logic
const isAnimating = ref(false)

// Helper to unlock animation state
const unlockAnimation = () => {
  isAnimating.value = false
}

// Navigation Logic
const scrollToPrev = () => {
  if (!trackRef.value || isAnimating.value) return
  isAnimating.value = true

  // Logic: Find the first item that is currently NOT fully visible on the LEFT.
  // Meaning its right edge is <= currentScrollLeft.
  // But "snap to last visible item on the left" implies we want to scroll LEFT.
  // So we want the item that is currently cut off on the left to become the new right-most item?
  // User said: "items to slide over the width of the viewable area but snap to the last visible item on the left."
  // Interpret: Scroll by ~ContainerWidth, but align such that the item that was on the far left edge becomes the far right edge?
  // Or: "snap to the last visible item on the left" -> The item that is currently the FIRST visible item on the left should become the LAST visible item on the RIGHT?
  // Let's try standard paging first, but aligned to items.

  // Simplest interpretation of "slide over width... snap to last visible on left":
  // Move left by ContainerWidth.
  // Then adjust to closest snap point?

  // Let's implement a "Page Left" that ensures we see new items.
  const containerW = containerWidth.value
  const targetScroll = Math.max(0, currentScrollLeft.value - containerW * 0.9) // 90% overlap for context

  trackRef.value.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  })

  // Safety timeout for unlock if scrollend doesn't fire (e.g. no movement or browser support)
  setTimeout(unlockAnimation, 600)
}

const scrollToNext = () => {
  if (!trackRef.value || isAnimating.value) return
  isAnimating.value = true

  // User said: "slide over the width of the viewable area but snap to the last visible item on the left."
  // This usually applies to the TARGET state.
  // So after scrolling right, the item that was previously the Right-Most fully visible item
  // should now be the Left-Most item. This ensures we don't miss anything.

  // Algorithm:
  // 1. Find the item currently at the Right Edge (partially or fully visible).
  // 2. Scroll so that item becomes the Left Edge.

  const containerW = containerWidth.value
  const currentScroll = currentScrollLeft.value

  // Find item whose start is closest to being just after the current view
  // Or simpler: Scroll by width, then snap?

  // Implementation of "Right-most becomes Left-most":
  // Find the last item that has (offsetLeft < currentScroll + containerWidth).

  let targetScroll = Math.min(maxScrollLeft.value, currentScroll + containerW)

  // iterate items to find the specific snap point
  // This is complex with variable widths.
  // Let's stick to simple scrolling for the first pass or the user will get bugs.
  // The "Squish" logic handles visual layout.

  // "Snap to the last visible item on the left"
  // When clicking right arrow -> We Paging Right.
  // The "Last visible item" of the PREVIOUS page becomes the "First (Left)" item of the NEW page.

  // 1. Find visible items
  // 2. Identify the last one (right most)
  // 3. Set scrollLeft to that item's offsetLeft.

  const items = Array.from(trackRef.value.children)
  let bestCandidateLeft = -1

  // visible range
  const viewStart = currentScroll
  const viewEnd = currentScroll + containerW

  // Find last visible item
  for (let item of items) {
    const itemStart = item.offsetLeft
    const itemWidth = item.offsetWidth
    const itemEnd = itemStart + itemWidth

    // Check if item is mostly visible? or just visible at all?
    // "Last visible item"
    if (itemStart < viewEnd - 5) {
      // -5 buffer
      // This item is at least partially in view on the left of the cut-off
      bestCandidateLeft = itemStart
    } else {
      // Item is past the view
      break
    }
  }

  if (bestCandidateLeft !== -1 && bestCandidateLeft > currentScroll + 5) {
    targetScroll = bestCandidateLeft
  } else {
    // Fallback or already at end
    targetScroll = currentScroll + containerW * 0.9
  }

  trackRef.value.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  })

  // Safety timeout for unlock if scrollend doesn't fire
  setTimeout(unlockAnimation, 600)
}

const scrollToPrevCustom = () => {
  if (!trackRef.value || isAnimating.value) return
  isAnimating.value = true

  const containerW = containerWidth.value
  const currentScroll = currentScrollLeft.value

  // We want to Go Left.
  // We want the current Left-Most item to become the Right-Most item?
  // Or just reverse of Next.

  // Simplest user-friendly logic:
  // Scroll Left by width.
  // Then snap to the nearest item start that aligns reasonably.

  // Find item whose END is currently at the Left Edge?
  // Let's just do simple paging for now to ensure robustness first.
  const target = Math.max(0, currentScroll - containerW)
  trackRef.value.scrollTo({ left: target, behavior: "smooth" })

  // Safety timeout for unlock if scrollend doesn't fire
  setTimeout(unlockAnimation, 600)
}

// Reuse logic from Advanced but adapted for Scroll
const measureItems = () => {
  if (!trackRef.value) return

  const children = Array.from(trackRef.value.children)
  if (!children.length) return

  // 1. Reset styles
  children.forEach((slide) => {
    slide.style.width = ""
    slide.style.maxWidth = ""
    slide.style.flex = "0 0 auto"
    slide.style.marginLeft = ""

    const content = slide.firstElementChild
    if (content) {
      content.style.width = ""
    }
  })

  // 2. Measure
  itemNativeDimensions.value = children.map((slide) => {
    const content = slide.firstElementChild
    return {
      width: content ? content.offsetWidth : slide.offsetWidth,
      height: slide.offsetHeight,
      element: slide,
    }
  })

  updateCachedSlides()

  // Calculate Max Scroll
  // Total Native Width + Gaps
  let totalW = 0
  itemNativeDimensions.value.forEach((d, i) => {
    totalW += d.width
    if (i < itemNativeDimensions.value.length - 1) totalW += props.gap
  })
  // If we have padding at end?
  maxScrollLeft.value = Math.max(0, totalW - containerWidth.value)

  updateSlideProgress()
}

const updateCachedSlides = () => {
  if (!trackRef.value) return
  cachedSlides.value = Array.from(trackRef.value.children)
}

const setStyle = (element, property, value) => {
  let cache = styleCache.get(element)
  if (!cache) {
    cache = {}
    styleCache.set(element, cache)
  }
  if (cache[property] !== value) {
    element.style[property] = value
    cache[property] = value
  }
}

// Core Scaling Logic
const updateSlideProgress = () => {
  if (
    !props.enableMaterialScaling ||
    !trackRef.value ||
    !itemNativeDimensions.value.length
  )
    return

  if (!cachedSlides.value.length) updateCachedSlides()

  const currentWidth = containerWidth.value
  const x = -currentScrollLeft.value // GSAP 'x' was negative; scrollLeft is positive. logic needs 'visualLeft' relative to 0.

  let accumulatedWidth = 0

  cachedSlides.value.forEach((slide, index) => {
    const dims = itemNativeDimensions.value[index]
    if (!dims) return

    let nativeWidth = dims.width
    let nativeHeight = dims.height

    const leftPos = accumulatedWidth
    const visualLeft = leftPos + x

    const availableSpaceRight = currentWidth - visualLeft
    const availableSpaceLeft = visualLeft + nativeWidth

    let targetWidth = nativeWidth // start full

    // Scale Logic
    if (visualLeft > 0) {
      // Right Edge
      targetWidth = Math.min(targetWidth, availableSpaceRight)
    } else {
      // Left Edge
      targetWidth = Math.min(targetWidth, availableSpaceLeft)
    }

    targetWidth = Math.max(targetWidth, props.minItemWidth)

    // Margin Compensation for Left Squish
    let marginLeft = 0
    if (visualLeft <= 0) {
      const lostWidth = nativeWidth - targetWidth
      if (lostWidth > 0) marginLeft = lostWidth
    }

    // Apply
    // We use setStyle shim
    setStyle(slide, "width", "100%")
    setStyle(slide, "maxWidth", `${targetWidth}px`)
    // setStyle(slide, "height", `${nativeHeight}px`) // Height usually auto or fixed by CSS
    setStyle(slide, "flex", `0 0 ${targetWidth}px`)
    setStyle(slide, "marginLeft", `${marginLeft}px`)

    // Transition?
    // Native scroll is smooth, but size changes might need transition?
    // If we transition width/margin, it might fight with scroll.
    // Usually immediate update is better for "sticky" feel, or very fast transition.
    setStyle(slide, "transition", "none")

    accumulatedWidth += targetWidth + marginLeft + props.gap
  })
}

// Observers
const setupContentObserver = () => {
  if (!trackRef.value) return
  if (!contentResizeObserver) {
    let debounceTimer
    contentResizeObserver = new ResizeObserver(() => {
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        measureItems()
      }, 50)
    })
  }

  const children = Array.from(trackRef.value.children)
  children.forEach((slide) => {
    const img = slide.querySelector("img")
    if (img) contentResizeObserver.observe(img)
    else {
      const content = slide.firstElementChild
      if (content) contentResizeObserver.observe(content)
    }
  })
}

let resizeTimeout
const onResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    measureItems()
    // Check arrows
    onScroll()
  }, 100)
}

let observer = null

onMounted(() => {
  if (carouselRef.value) {
    containerWidth.value = carouselRef.value.offsetWidth
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        containerWidth.value = entry.contentRect.width
        onResize()
      }
    })
    resizeObserver.observe(carouselRef.value)
  }

  if (trackRef.value) {
    observer = new MutationObserver(() => {
      onResize()
      // also Re-observe new content?
      setupContentObserver()
    })
    observer.observe(trackRef.value, { childList: true })

    // Initial Scroll Check
    onScroll()

    // Add scrollend listener for robust unlock
    trackRef.value.addEventListener("scrollend", unlockAnimation)
  }

  requestAnimationFrame(() => {
    setupContentObserver()
    measureItems()
    onScroll() // Init arrows
    setTimeout(measureItems, 100) // Late load
  })
})

onBeforeUnmount(() => {
  if (trackRef.value) {
    trackRef.value.removeEventListener("scrollend", unlockAnimation)
  }
  if (observer) observer.disconnect()
  if (resizeObserver) resizeObserver.disconnect()
  if (contentResizeObserver) contentResizeObserver.disconnect()
  clearTimeout(resizeTimeout)
})
</script>

<template>
  <div
    class="material-carousel-basic"
    ref="carouselRef"
    :style="maskStyle"
    role="region"
    aria-label="carousel"
  >
    <!-- Left Arrow -->
    <button
      v-show="showLeftArrow"
      class="nav-arrow nav-arrow-left"
      @click="scrollToPrevCustom"
      aria-label="Previous items"
    >
      <!-- Simple Chevron Left SVG -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <div
      class="carousel-track"
      ref="trackRef"
      @scroll="onScroll"
      :class="{
        'material-scaling': enableMaterialScaling,
      }"
      :style="{
        gap: `${gap}px`,
      }"
    >
      <slot />
    </div>

    <!-- Right Arrow -->
    <button
      v-show="showRightArrow"
      class="nav-arrow nav-arrow-right"
      @click="scrollToNext"
      aria-label="Next items"
    >
      <!-- Simple Chevron Right SVG -->
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</template>

<style lang="scss" scoped>
.material-carousel-basic {
  width: 100%;
  overflow: hidden;
  position: relative;

  // To allow arrows to float over
  display: flex;
  align-items: center;
}

.carousel-track {
  display: flex;
  flex-direction: row;
  align-items: flex-start;

  overflow-x: auto;
  overflow-y: hidden;
  /* scroll-snap-type: x mandatory;  <-- Disable global snap if we do custom logic or mixed widths */
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;

  width: 100%;

  // Hide scrollbar
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

// Style slotted items using deep selector
.carousel-track :deep(> *) {
  flex: 0 0 auto;
  width: auto;
  height: auto;
  /* scroll-snap-align: start; */
  box-sizing: border-box;
  overflow: hidden;

  contain: layout style;
  will-change: transform, max-width, margin-left;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block; // Fix bottom gap
  }
}

.nav-arrow {
  position: absolute;
  z-index: 10;
  top: 50%;
  transform: translateY(-50%);

  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;

  &:hover {
    background: #f8f8f8;
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &.nav-arrow-left {
    left: 16px;
  }

  &.nav-arrow-right {
    right: 16px;
  }
}
</style>
