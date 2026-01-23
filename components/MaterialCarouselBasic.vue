<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

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
    default: 40,
  },
  // Buffer to maintain visually on the left when snapping
  marginBuffer: {
    type: Number,
    default: 48,
  },
});

const carouselRef = ref(null);
const trackRef = ref(null);
const currentScrollLeft = ref(0);
const maxScrollLeft = ref(0);
const containerWidth = ref(0);
const showLeftArrow = ref(false);
const showRightArrow = ref(true);

// Resize observing
let resizeObserver = null;

// Edge fade gradient mask style - Dynamic based on scroll position
const maskStyle = computed(() => {
  if (!props.edgeFade) return {};

  const fadeDistance = props.edgeFadeDistance;
  const isStart = currentScrollLeft.value <= 5; // Tolerance
  const isEnd = currentScrollLeft.value >= maxScrollLeft.value - 5; // Tolerance

  let maskString = "";

  if (isStart && isEnd) {
    // Content fits, no mask needed usually, or full visibility
    return {};
  } else if (isStart) {
    // Only right mask
    maskString = `linear-gradient(to right, black calc(100% - ${fadeDistance}px), transparent 100%)`;
  } else if (isEnd) {
    // Only left mask
    maskString = `linear-gradient(to right, transparent 0, black ${fadeDistance}px)`;
  } else {
    // Both masks
    maskString = `linear-gradient(to right, transparent 0, black ${fadeDistance}px, black calc(100% - ${fadeDistance}px), transparent 100%)`;
  }

  return {
    maskImage: maskString,
    WebkitMaskImage: maskString,
  };
});

// Scroll Handler
const onScroll = () => {
  if (!trackRef.value) return;
  currentScrollLeft.value = trackRef.value.scrollLeft;

  // Update Arrow State
  showLeftArrow.value = currentScrollLeft.value > 5;
  // Allowing a small buffer for float precision
  showRightArrow.value = currentScrollLeft.value < maxScrollLeft.value - 5;
};

// Navigation Logic
const isAnimating = ref(false);

// Helper to unlock animation state
const unlockAnimation = () => {
  isAnimating.value = false;
};

const getSnapPosition = (targetPos, direction) => {
  if (!trackRef.value) return targetPos;
  const children = Array.from(trackRef.value.children);

  // Find closest item start to targetPos
  // But strictly respecting direction relative to current position

  let bestPos = targetPos;
  let minDiff = Infinity;

  // Safety buffer
  const current = currentScrollLeft.value;
  const buffer = 10;
  const bufferOffset = props.marginBuffer;

  for (const child of children) {
    // Adjust pos to account for the visual buffer we want to maintain
    // So if child starts at 100, and buffer is 20, we want to snap to 80 (so child starts at 20 visual)
    const pos = Math.max(0, child.offsetLeft - bufferOffset);

    // Direction constraint
    if (direction === "next" && pos <= current + buffer) continue;
    if (direction === "prev" && pos >= current - buffer) continue;

    // Find closest snap point to the ideal target
    const diff = Math.abs(pos - targetPos);
    if (diff < minDiff) {
      minDiff = diff;
      bestPos = pos;
    }
  }

  // Boundary checks if nothing found (should rarely happen if target is reasonable)
  if (minDiff === Infinity) {
    return direction === "next" ? maxScrollLeft.value : 0;
  }

  return bestPos;
};

const scrollToPrev = () => {
  if (!trackRef.value || isAnimating.value) return;
  isAnimating.value = true;

  const containerW = containerWidth.value;
  const idealTarget = currentScrollLeft.value - containerW * 0.9;
  const targetScroll = getSnapPosition(Math.max(0, idealTarget), "prev");

  trackRef.value.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });

  // Safety timeout for unlock if scrollend doesn't fire
  setTimeout(unlockAnimation, 600);
};

const scrollToNext = () => {
  if (!trackRef.value || isAnimating.value) return;
  isAnimating.value = true;

  const containerW = containerWidth.value;
  const idealTarget = currentScrollLeft.value + containerW * 0.9;
  const targetScroll = getSnapPosition(
    Math.min(maxScrollLeft.value, idealTarget),
    "next"
  );

  trackRef.value.scrollTo({
    left: targetScroll,
    behavior: "smooth",
  });

  // Safety timeout for unlock if scrollend doesn't fire
  setTimeout(unlockAnimation, 600);
};

// Update metrics logic
const updateMetrics = () => {
  if (!trackRef.value || !carouselRef.value) return;

  containerWidth.value = carouselRef.value.offsetWidth;
  // maxScrollLeft is total scroll width minus visible width
  maxScrollLeft.value = trackRef.value.scrollWidth - trackRef.value.clientWidth;

  onScroll();
};

let mutationObserver = null;

onMounted(() => {
  if (carouselRef.value) {
    containerWidth.value = carouselRef.value.offsetWidth;
    resizeObserver = new ResizeObserver((entries) => {
      // Wrap in rAF to avoid "ResizeObserver loop limit exceeded"
      requestAnimationFrame(() => {
        if (!entries.length) return;
        updateMetrics();
      });
    });
    resizeObserver.observe(carouselRef.value);
  }

  if (trackRef.value) {
    mutationObserver = new MutationObserver(() => {
      // Content changed (e.g. items added), re-measure scroll width
      updateMetrics();
    });
    mutationObserver.observe(trackRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // Initial Scroll Check
    updateMetrics();

    // Add scrollend listener for robust unlock
    trackRef.value.addEventListener("scrollend", unlockAnimation);
  }

  // Double check after a tick to ensure layout is done
  setTimeout(updateMetrics, 100);
});

onBeforeUnmount(() => {
  if (trackRef.value) {
    trackRef.value.removeEventListener("scrollend", unlockAnimation);
  }
  if (mutationObserver) mutationObserver.disconnect();
  if (resizeObserver) resizeObserver.disconnect();
});
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
      @click="scrollToPrev"
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
    left: calc(20px + v-bind("props.marginBuffer") * 1px);
  }

  &.nav-arrow-right {
    right: calc(20px + v-bind("props.marginBuffer") * 1px);
  }
}
</style>
