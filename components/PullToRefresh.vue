<template>
  <div ref="ptrRef" class="pull-to-refresh" :style="`top:${visualIndicatorY}px`">
    <i ref="ptrIconRef" class="refresh-indicator pi pi-sync" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"

const { $gsap } = useNuxtApp()

const ptrRef = ref(null)
const ptrIconRef = ref(null)
const startPosition = -40
const maxOffset = 150
const pStart = ref({ y: 0 })
const pStop = ref({ y: 0 })
const scrollPosition = ref(0)
const visualIndicatorY = ref(startPosition)

const backToTop = (delay = 0) => {
  $gsap.to(ptrRef.value, {
    delay,
    top: startPosition,
    duration: 0.3,
    ease: "power4.in",
  })
}
const refresh = async () => {
  await refreshNuxtData()
  $gsap.set(ptrIconRef.value, {
    rotate: 0,
    overwrite: true,
  })
  $gsap.to(ptrIconRef.value, {
    duration: 1.5,
    rotate: 720,
    //overwrite: true,
    ease: "linear.none",
  })
}

function swipeStart(e) {
  // Check if the page is scrolled to the top
  $gsap.set(ptrIconRef.value, {
    rotate: 0,
    overwrite: true,
  })
  if (scrollPosition.value === 0) {
    if (typeof e.targetTouches !== "undefined") {
      const touch = e.targetTouches[0]
      pStart.value.y = touch.screenY
    } else {
      pStart.value.y = e.screenY
    }
  }
}

function swipeMove(e) {
  if (typeof e.targetTouches !== "undefined") {
    scrollPosition.value = window.scrollY
  }
  if (scrollPosition.value === 0) {
    const touch = e.targetTouches[0]
    const offset = touch.screenY - pStart.value.y + startPosition
    visualIndicatorY.value = offset >= maxOffset ? maxOffset : offset
  }
}

function swipeEnd(e) {
  if (typeof e.changedTouches !== "undefined") {
    const touch = e.changedTouches[0]
    pStop.value.y = touch.screenY
  } else {
    pStop.value.y = e.screenY
  }

  swipeCheck()
}

function swipeCheck() {
  const changeY = pStart.value.y - pStop.value.y
  if (isPullDown(changeY)) {
    refresh()
    backToTop(0.5)
  } else {
    backToTop()
  }
}

function isPullDown(dY) {
  return Math.abs(dY) >= maxOffset - startPosition
}

onMounted(() => {
  document.addEventListener("touchstart", swipeStart, false)
  document.addEventListener("touchmove", swipeMove, false)
  document.addEventListener("touchend", swipeEnd, false)
})

onUnmounted(() => {
  document.removeEventListener("touchstart", swipeStart, false)
  document.removeEventListener("touchmove", swipeMove, false)
  document.removeEventListener("touchend", swipeEnd, false)
})
</script>

<style scoped>
.pull-to-refresh {
  position: absolute;
  display: flex;
  top: 0px;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ffffff;
  left: 0;
  right: 0;
  margin: auto;
  z-index: 389475398457;
  justify-content: center;
  align-items: center;
  -webkit-box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.75);
  box-shadow: 0 0 10px 5px rgba(0, 0, 0, 0.75);
  .refresh-indicator {
    font-size: 24px;
    color: var(--night-500, #000000);
  }
}
</style>
