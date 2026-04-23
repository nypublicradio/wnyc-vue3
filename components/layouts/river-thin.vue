<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12",
  },
  seeMore: {
    type: Object,
    default: null,
    required: false,
  },
  loading: {
    type: String,
    default: "lazy",
  },
})
</script>

<template>
  <layouts-river
    :label="props.label"
    :list="props.list"
    :cardClass="props.cardClass"
    :seeMore="props.seeMore"
    :loading="props.loading"
  />
</template>
