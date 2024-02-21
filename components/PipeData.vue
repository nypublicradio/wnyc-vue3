<script setup>
const props = defineProps({
  hidePipe: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="pipe-data flex row-gap-0 flex-wrap align-items-center">
    <div class="flex align-items-center mr-2">
      <slot name="left" />
      <!-- <div class="pipe mx-2" v-if="!props.hidePipe" /> -->
    </div>
    <div class="flex align-items-center">
      <div class="pipe mr-2" v-if="!props.hidePipe" />
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pipe-data {
  .pipe {
    line-height: 0rem;
    border-left: 1px solid var(--text-color);
    height: 0.75rem;
  }
}
</style>
```
