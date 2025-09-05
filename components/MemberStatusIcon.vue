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
})
</script>
<template>
  <img
    :src="`/member-status-icon/${props.brand}-${props.status}.svg`"
    alt="Membership certificate icon"
    class="max-w-4rem h-auto"
  />
</template>
