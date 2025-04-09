<script setup>
import { useScroll } from "@vueuse/core"
import { onMounted, ref, shallowRef, watch } from "vue"

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
})

// set the css var for the header height
const headerHeightCssVar = ref(props.headerHeightCssVar)

// scroll handlers
let scroll = null
if (import.meta.client) {
  scroll = useScroll(
    props.targetWindowClass
      ? document.getElementsByClassName(props.targetWindowClass)[0]
      : window,
    {
      behavior: "smooth",
    }
  )
}

const isMinimized = ref(props.reverse ? true : false)

watch([scroll?.y, scroll?.directions, scroll?.isScrolling], ([y, top, isScrolling]) => {
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
  <Transition name="v-smart-header-minimize">
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
  //box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.36);
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
