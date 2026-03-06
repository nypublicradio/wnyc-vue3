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
  maxItems: {
    type: Number,
    default: null,
  },
  seeMore: {
    type: Object,
    default: null,
    required: false,
  },
  isThin: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <layouts-vertical-feature
    :is-thin="props.isThin"
    :label="props.label"
    :list="props.list"
    :max-items="props.maxItems"
    :see-more="props.seeMore"
  />
</template>

