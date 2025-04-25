<script setup lang="ts">
const props = defineProps({
  bool: {
    type: Boolean,
    default: false,
  },
  speed: {
    type: Number,
    default: 0.3,
  },
  delay: {
    type: Number,
    default: 0.2,
  },
  color: {
    type: String,
    default: "#fff",
  },
})

const { $gsap } = useNuxtApp()
const tl = $gsap.timeline()

const hbAnimRef = ref(null)
const hbAnimRef1 = ref(null)
const hbAnimRef2 = ref(null)
const hbAnimRef3 = ref(null)

const delay = props.delay
const dur = props.speed
onMounted(() => {
  tl.pause()
  tl.to(
    [hbAnimRef1.value, hbAnimRef3.value],
    {
      delay: delay,
      duration: dur,
      ease: "power2.inOut",
      y: (i) => (i === 0 ? -5 : 5), // Apply -5.8 to hbAnimRef1 and 5.8 to hbAnimRef3
      x: 0,
      transformOrigin: "50% 50%",
    },
    0 // Start both animations at the same time
  )
  tl.to(hbAnimRef1.value, {
    duration: dur,
    ease: "power2.inOut",
    rotation: -45,
    transformOrigin: "50% 50%",
  })
    .to(
      hbAnimRef2.value,
      {
        duration: dur,
        ease: "power2.inOut",
        scaleX: 0,
        transformOrigin: "50% 50%",
      },
      "<"
    )
    .to(
      hbAnimRef3.value,
      {
        duration: dur,
        ease: "power2.inOut",
        rotation: 45,
        transformOrigin: "50% 50%",
      },
      "<"
    )
})
watch(
  () => props.bool,
  async (newVal) => {
    await nextTick()
    console.log("newVal", newVal)
    if (newVal) {
      tl.play()
    } else {
      tl.reverse()
    }
  },
  { immediate: true }
)
</script>
<template>
  <svg
    ref="hbAnimRef"
    class="hb-anim relative"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    :stroke="props.color"
    stroke-width="1.5"
    fill="rgba(0,0,0,0)"
    stroke-linecap="round"
    style="cursor: pointer; padding: 3px"
  >
    <path ref="hbAnimRef1" d="M4 17L20 17"></path>
    <path ref="hbAnimRef2" d="M4 12L20 12"></path>
    <path ref="hbAnimRef3" d="M4 7L20 7"></path>
  </svg>
</template>
