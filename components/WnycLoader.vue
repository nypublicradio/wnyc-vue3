<script setup>
import { ref } from 'vue'
const { $gsap } = useNuxtApp()
let tl = null
const wnycLoader = ref(null)
const ready = ref(false)

function randomNumber(min, max) {
  return Math.random() * (max - min) + min
}

onMounted(() => {
  ready.value = true
  const bars = wnycLoader.value.getElementsByClassName('st1')
  tl = $gsap.timeline()
  const loop = () => {
    let rnd = randomNumber(-30, -10)
    for (var i = 0; i < bars.length; i++) {
      tl.to(
        bars[i],
        {
          y: rnd,
          duration: 1,
          yoyo: true,
          repeat: 1,
          onComplete: () => {
            loop()
          },
        },
        '-=1.5'
      )
    }
  }
  loop()
})

onBeforeUnmount(() => {
  tl.kill()
  tl = null
})
</script>

<template>
  <transition name="fade">
    <div v-show="ready" ref="wnycLoader">
      <svg
        class="wnyc-loader"
        x="0px"
        y="0px"
        viewBox="0 0 75.1 30"
        style="enable-background: new 0 0 75.1 30"
      >
        <rect id="b4" x="38.7" y="30" class="st1" width="16.9" height="30" />
        <rect id="b3" x="58.1" y="30" class="st1" width="16.9" height="30" />
        <rect id="b2" x="19.4" y="30" class="st1" width="16.9" height="30" />
        <rect id="b1" x="0" y="30" class="st1" width="16.9" height="30" />
      </svg>
    </div>
  </transition>
</template>

<style scoped>
.wnyc-loader .st1 {
  transform-origin: top;
  fill: var(--primary-color, #de1e3d);
}
.style-mode-dark .wnyc-loader .st1 {
  fill: #ffffff;
}
</style>
