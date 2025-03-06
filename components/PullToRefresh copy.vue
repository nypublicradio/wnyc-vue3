<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue"
import { useIsNetworkConnected } from "~/composables/states"
const isNetworkConnected = useIsNetworkConnected()
const { $gsap } = useNuxtApp()

const ptrRef = ref(null)
const ptrIconRef = ref(null)
const ptrIconDoneRef = ref(null)
const startPosition = -50
const maxOffset = 125
const pStart = ref({ y: 0 })
const pStop = ref({ y: 0 })
const visualIndicatorY = ref(startPosition)
const backToTopAnimDuration = ref(0.3)
const backToTopAnimDurationS = ref(`${backToTopAnimDuration.value}s`)
const refreshing = ref(false)
const swipeMoved = ref(false)

// add the touch event listeners
const addSwipeStartListeners = () => {
  window.addEventListener("touchstart", swipeStart, false)
}
// remove the touch event listeners
const removeSwipeStartListeners = () => {
  window.removeEventListener("touchstart", swipeStart, false)
}
// add the touch move and end event listeners
const addSwipeMoveEndListeners = () => {
  window.addEventListener("touchmove", swipeMove, false)
  window.addEventListener("touchend", swipeEnd, false)
}
// remove the touch move and end event listeners
const removeSwipeMoveEndListeners = () => {
  window.removeEventListener("touchmove", swipeMove, false)
  window.removeEventListener("touchend", swipeEnd, false)
}

let backToTopAnim = ref(false)
// animate the pull to refresh indicator back to the top
const backToTop = (delay = 0) => {
  backToTopAnim.value = true
  setTimeout(() => {
    visualIndicatorY.value = startPosition
    backToTopAnim.value = false
  }, backToTopAnimDuration.value * 1000 + delay)
}
// handle the pull to refresh action
let tl = null
let tlDone = null
// reset the animation
const resetAnimation = () => {
  tl?.revert()
  tl?.kill()
  tlDone?.revert()
  tlDone?.kill()
}
// handle the refresh and animation
const refresh = async () => {
  refreshing.value = true
  removeSwipeStartListeners()
  resetAnimation()

  tl = $gsap.timeline()
  tlDone = $gsap.timeline()
  try {
    //updateAllLiveStreams()
    // refresh all data (still not sure ecactly how this works)
    // await refreshNuxtData()

    // animate the pull to refresh indicator icon
    tl.set(ptrIconRef.value, {
      rotate: 0,
      overwrite: true,
    })
    tl.set(ptrRef.value, {
      rotateY: 0,
      overwrite: true,
    })
    tl.to(ptrIconRef.value, {
      duration: 0.75,
      rotate: 360,
      ease: "none",
      repeat: -1,
    })
  } finally {
    setTimeout(() => {
      tl.pause()
      tlDone.to(ptrIconRef.value, {
        duration: 0.5,
        scale: 0,
        ease: "circ.out",
        overwrite: true,
      })
      tlDone.to(ptrIconDoneRef.value, {
        duration: 0.5,
        scale: 0.8,
        opacity: 1,
        ease: "back.out",
        delay: -0.5,
      })
      tlDone.call(() => {
        location.reload()
        // backToTop()
        // setTimeout(() => {
        //   resetAnimation()
        //   refreshing.value = false
        //   addSwipeStartListeners()
        // }, backToTopAnimDuration * 1000)
      })
    }, 750)
  }
}

// handle the pull to refresh START event
function swipeStart(e) {
  // Check if the page is scrolled to the top
  if (window.scrollY < 10) {
    //console.log("swipeStart")
    resetAnimation()
    addSwipeMoveEndListeners()
    if (typeof e.targetTouches !== "undefined") {
      const touch = e.targetTouches[0]
      pStart.value.y = touch.screenY
    } else {
      pStart.value.y = e.screenY
    }
  }
}

// handle the pull to refresh MOVE/UPDATE event to track the offset and move the indicator
function swipeMove(e) {
  //console.log("swipeMove")
  swipeMoved.value = true

  const touch = e.targetTouches[0]
  const offset = touch.screenY - pStart.value.y + startPosition
  visualIndicatorY.value = offset >= maxOffset ? maxOffset : offset
}

// handle the pull to refresh END event, when the user releases the touch
function swipeEnd(e) {
  if (swipeMoved.value) {
    //console.log("swipeEnd")
    if (typeof e.changedTouches !== "undefined") {
      const touch = e.changedTouches[0]
      pStop.value.y = touch.screenY
    } else {
      pStop.value.y = e.screenY
    }
    swipeMoved.value = false
    swipeCheck()
  }
  removeSwipeMoveEndListeners()
}

// determine if the swipe was a pulled down to the max offset - start position (the end)
function isPullDown(dY) {
  return Math.abs(dY) >= maxOffset - startPosition
}

// check if the swipe was a pull down all the way or not
function swipeCheck() {
  const changeY = pStart.value.y - pStop.value.y
  if (isPullDown(changeY) && window.scrollY === 0) {
    refresh()
  } else {
    backToTop()
  }
}

onMounted(() => {
  //console.log("PullToRefresh mounted")
  addSwipeStartListeners()
})

onBeforeUnmount(() => {
  tl?.kill()
  tl = null
  tlDone?.kill()
  tlDone = null

  removeSwipeStartListeners()
  removeSwipeMoveEndListeners()
})
</script>

<template>
  <div
    ref="ptrRef"
    class="pull-to-refresh"
    :class="{ 'back-to-top': backToTopAnim }"
    :style="{
      transform: `translate3d(0,calc(${visualIndicatorY}px - env(safe-area-inset-top)),1px)`,
    }"
  >
    <i ref="ptrIconRef" class="refresh-indicator pi pi-sync" />
    <div
      ref="ptrIconDoneRef"
      class="done-indicator"
      :class="[{ error: !isNetworkConnected }]"
    >
      <i
        v-if="isNetworkConnected"
        ref="ptrIconCheckRef"
        class="done-icon check pi pi-check"
      />
      <i v-else ref="ptrIconErrorRef" class="done-icon error pi pi-times" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pull-to-refresh {
  position: absolute;
  display: flex;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: 2px solid var(--solid-bg-color);
  background-color: #ffffff;
  left: 0;
  right: 0;
  top: 0;
  margin: auto;
  z-index: 389475398457;
  justify-content: center;
  align-items: center;
  &.back-to-top {
    transition: transform v-bind(backToTopAnimDurationS) ease-in;
    transform: translate3d(0, calc(-50px - env(safe-area-inset-top)), 1px) !important;
  }
  .refresh-indicator {
    font-size: 24px;
    color: var(--night-500, #000000);
  }
  .done-indicator {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 34px;
    height: 34px;
    border-radius: 20px;
    background-color: var(--success, #00ff00);
    opacity: 0;
    transform: scale(0);
    &.error {
      background-color: var(--error, #ff0000);
    }
    .error,
    .check {
      font-size: 20px;
      color: white;
      font-weight: bolder;
    }
  }
}
</style>
