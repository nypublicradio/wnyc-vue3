<script setup>
const props = defineProps({
  hidePipe: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="pipe-data w-full">
    <span class="inline"
      ><slot name="left" /><span>{{ props.hidePipe ? " " : " | " }}</span
      ><slot name="right"
    /></span>
  </div>
</template>

<style lang="scss" scoped>
.pipe-data {
  color: var(--text-color);
}
</style>
```
