<script setup>
const props = defineProps({
  lines: {
    type: Number,
    default: 10,
  },
  gapMin: {
    type: Number,
    default: 2,
  },
  gapMax: {
    type: Number,
    default: 6,
  },
  radius: {
    type: String,
    default: "16px",
  },
  height: {
    type: String,
    default: "0.825rem",
  },
})

function rndWidth(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return `${Math.floor(Math.random() * (max - min + 1)) + min}%`
}
const rndGap = (min = props.gapMin, max = props.gapMax) => {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const gap = rndGap()
</script>

<template>
  <Skeleton
    v-for="(line, index) in props.lines"
    :key="`sk-text-${index}`"
    :height="props.height"
    :width="rndWidth(75, 100)"
    :borderRadius="props.radius"
    class="mb-1"
    :class="gap === index ? 'mb-5' : ''"
    v-bind="{ ...$props, ...$attrs }"
  />
</template>

<style lang="scss" scoped>
.skeleton-text {
}
</style>
