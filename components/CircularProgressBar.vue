<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  radius: {
    type: Number,
    default: 12,
  },
  progress: {
    type: Number,
    default: 100,
  },
  stroke: {
    type: String,
    default: '2',
  },
  color: {
    type: String,
    default: 'var(--night-500)',
  },
})

const normalizedRadius = props.radius - props.stroke * 2
const circumference = normalizedRadius.value * 2 * Math.PI

const strokeDashoffset = computed(() => {
  return circumference.value - (props.progress / 100) * circumference.value
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
      :stroke="color"
      fill="transparent"
      :stroke-dasharray="circumference + ' ' + circumference"
      :style="{ strokeDashoffset }"
      :stroke-width="stroke"
      :r="normalizedRadius"
      :cx="radius"
      :cy="radius"
    />
  </svg>
</template>
