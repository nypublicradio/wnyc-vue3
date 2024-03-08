<script setup>
import { computed } from "vue"

const props = defineProps({
  radius: {
    type: Number,
    default: 12,
  },
  progress: {
    type: Number,
    default: 0,
  },
  stroke: {
    type: String,
    default: "2",
  },
  color: {
    type: String,
    default: "var(--night-500)",
  },
  bgColor: {
    type: String,
    default: "#e3e3e3",
  },
})

const normalizedRadius = props.radius - props.stroke * 2
const circumference = Math.ceil(normalizedRadius * 2 * Math.PI)

const strokeDashoffset = computed(() => {
  return circumference - (props.progress / 100) * circumference
})
</script>
<template>
  <svg
    :height="radius * 2"
    :width="radius * 2"
    style="transform: rotate(-90deg)"
    class="circular-progress-bar"
  >
    <circle
      :stroke="bgColor"
      fill="transparent"
      :stroke-dasharray="circumference"
      :stroke-width="stroke"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
    <circle
      :stroke="color"
      fill="transparent"
      :stroke-dasharray="circumference"
      :style="`stroke-dashoffset: ${strokeDashoffset}px;`"
      :stroke-width="stroke"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
  </svg>
</template>
