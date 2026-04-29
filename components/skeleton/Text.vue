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

const widths = ["100%", "98%", "85%", "97%", "78%", "88%", "95%", "82%", "90%", "75%"]
const gap = Math.min(props.gapMin + 2, props.gapMax)
</script>

<template>
  <div v-bind="$attrs">
    <Skeleton
      v-for="(line, index) in props.lines"
      :key="`sk-text-${index}`"
      :height="props.height"
      :width="widths[index % widths.length]"
      :borderRadius="props.radius"
      class="mb-1"
      :class="gap === index ? 'mb-5' : ''"
    />
  </div>
</template>

<style lang="scss" scoped>
.skeleton-text {
}
</style>
