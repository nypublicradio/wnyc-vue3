<script setup>
const props = defineProps({
  list: {
    type: Object,
    required: true
  }
})
</script>

<template>
  <div class="layout layout-left-feature">
    <h2>{{ props.list.title }}</h2>
  </div>
</template>
