<script setup>
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
})

const items = toRef(props.list, "listItems")
console.log("Featured Topic Items:", items.value)
console.log("Featured Topic Items:", props.list.listItems)
</script>

<template>
  <div class="layout layout-featured-topic">
    <h2>{{ props.list.title }}</h2>
  </div>
</template>
