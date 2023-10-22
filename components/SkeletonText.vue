<script setup>
const props = defineProps({
  lines: {
    type: Number,
    default: 4,
  },
  radius: {
    type: String,
    default: '16px',
  },
  height: {
    type: String,
    default: '0.825rem',
  },
})

function rndWidth(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return `${Math.floor(Math.random() * (max - min + 1)) + min}%`
}
</script>

<template>
  <Skeleton
    v-for="line in props.lines"
    :height="props.height"
    :width="rndWidth(75, 100)"
    :borderRadius="props.radius"
    class="mb-1"
    v-bind="{ ...$props, ...$attrs }"
  ></Skeleton>
</template>

<style lang="scss" scoped>
.skeleton-text {
}
</style>
