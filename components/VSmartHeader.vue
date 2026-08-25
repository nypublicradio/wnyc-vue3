<script setup>
import { useScroll } from "@vueuse/core"
import { ref, watch } from "vue"

const props = defineProps({
  /**
   * number of pixels at the top of the page before the header minimizes
   */
  headerHeightCssVar: {
    default: "var(--header-height-app)",
    type: String,
  },
  /**
   * number of pixels at the top of the page before the header minimizes
   */
  heroBuffer: {
    default: 400,
    type: Number,
  },
  /**
   * multiplier of the --transition-duration css var that determines the delay before the header minimizes when resuming to scroll down after scrolling up to show the menu
   */
  resumeDelay: {
    default: 3,
    type: Number,
  },
  /**
   * element class to use for scrolling (default is window)
   */
  targetWindowClass: {
    default: null,
    type: String,
  },
  /**
   * class to force the header to hide
   */
  hide: {
    default: false,
    type: Boolean,
  },
  /**
   * class to force the header to show instead of hiding
   */
  reverse: {
    default: false,
    type: Boolean,
  },
  /**
   * animation name
   */
  transitionName: {
    default: "v-smart-header-minimize",
    type: String,
  },
})

// set the css var for the header height
const headerHeightCssVar = ref(props.headerHeightCssVar)

// scroll handlers
const isMinimized = ref(props.reverse ? true : false)

onMounted(() => {
  const scrollTarget = props.targetWindowClass
    ? document.getElementsByClassName(props.targetWindowClass)[0]
    : window

  const scroll = useScroll(scrollTarget, {
    behavior: "smooth",
  })

  // initialize the scroll position and determine if the header should be minimized based on the initial scroll position. This is for when pages are reloaded in the middle of the page. Otherwise the header would be missing until the user initially scrolled.
  const initScrollTop =
    scrollTarget === window ? window.scrollY : scrollTarget.scrollTop
  if (initScrollTop > 0) {
    isMinimized.value = props.reverse ? false : true
  }

  watch(
    [scroll.y, scroll.directions, scroll.isScrolling],
    ([y, top, isScrolling]) => {
      if (props.hide) {
        return
      }
      if (isScrolling) {
        const minimized =
          y > props.heroBuffer && props.reverse
            ? true
            : top.top
            ? false
            : !top.top && y > props.heroBuffer
            ? true
            : false
        isMinimized.value = props.reverse ? !minimized : minimized
      }
    },
    { immediate: true }
  )
})

watch(
  () => props.hide,
  (newValue) => {
    isMinimized.value = props.reverse ? !newValue : newValue
  },
  { immediate: true }
)
</script>

<template>
  <Transition :name="props.transitionName">
    <div v-show="!isMinimized" class="v-smart-header">
      <slot />
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
.v-smart-header {
  position: fixed;
  left: 0;
  top: 0;
  top: env(safe-area-inset-top);
  width: 100%;
  z-index: 999;
}
//expand
.v-smart-header-minimize-enter-active {
  transition: top calc(var(--p-transition-duration) * 2) ease-out;
}
.v-smart-header-minimize-leave-active {
  transition: top calc(var(--p-transition-duration) * 2) ease-in;
  transition-delay: calc(var(--p-transition-duration) * v-bind(resumeDelay));
}
.v-smart-header-minimize-enter-from,
.v-smart-header-minimize-leave-to {
  top: calc(-1 * v-bind(headerHeightCssVar));
}
</style>