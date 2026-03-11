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
    default: "col-12 md:col-12 lg:col-6 mb-3",
  },
  maxItems: {
    type: Number,
    default: 4,
  },
  scrolling: {
    type: Boolean,
    default: false,
  },
  scrollingMaxItems: {
    type: Number,
    default: 5,
  },
  gap: {
    type: String,
    default: null,
  },
  square: {
    type: Boolean,
    default: true,
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
  <layouts-four-pack
    :label="props.label"
    :list="props.list"
    :cardClass="props.cardClass"
    :maxItems="props.maxItems"
    :scrolling="props.scrolling"
    :scrollingMaxItems="props.scrollingMaxItems"
    :gap="props.gap"
    :square="props.square"
    :seeMore="props.seeMore"
    :isThin="props.isThin"
  />
</template>
