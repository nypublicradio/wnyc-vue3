<script setup>
const props = defineProps({
  brand: {
    type: String,
    default: "wnyc",
  },
  status: {
    type: String,
    default: "check",
  },
  size: {
    type: String,
    default: "max-w-4rem",
  },
})
</script>
<template>
  <img
    :src="`/member-status-icon/${props.brand}-${props.status}.svg`"
    alt="Membership certificate icon"
    class="h-auto"
    :class="props.size"
  />
</template>
