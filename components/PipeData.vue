<script setup>
const props = defineProps({
  hidePipe: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div
    class="pipe-data flex column-gap-1 row-gap-0 flex-wrap align-items-center"
  >
    <slot name="left" />
    <div class="flex column-gap-1 align-items-center">
      <div class="pipe" v-if="!props.hidePipe">|</div>
      <slot name="right" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pipe-data {
  .pipe {
    line-height: 0rem;
  }
}
</style>
```
