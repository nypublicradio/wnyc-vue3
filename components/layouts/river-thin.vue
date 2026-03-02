<script setup>
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12",
  },
})
</script>

<template>
  <layouts-river :list="props.list" :cardClass="props.cardClass" />
</template>
