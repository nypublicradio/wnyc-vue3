<script setup>
const props = defineProps({
  hidePipe: {
    type: Boolean,
    default: false,
  },
  fullWidth: {
    type: Boolean,
    default: true,
  },
})
</script>

<template>
  <div class="pipe-data" :class="{ 'w-full': props.fullWidth }">
    <span class="inline"
      ><slot name="left" /><span>{{ props.hidePipe ? " " : " | " }}</span
      ><slot name="right"
    /></span>
  </div>
</template>

<style lang="scss" scoped>
.pipe-data {
  color: var(--p-text-color);
}
</style>
