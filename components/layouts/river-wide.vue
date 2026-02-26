<script setup>
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 lg:col-6",
  },
})
</script>

<template>
  <river :list="props.list" :cardClass="props.cardClass" />
</template>
