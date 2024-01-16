<script setup>
const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  optionLabel: {
    type: String,
    default: "label",
  },
  data: {
    type: [String, Object],
    default: null,
  },
  label: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select",
  },
})
</script>
<template>
  <DropupMenu
    v-model="props.data"
    :label="props.label"
    :options="props.options"
    :optionLabel="props.optionLabel"
    :placeholder="props.placeholder"
  />
</template>
