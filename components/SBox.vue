<script setup>
const props = defineProps({
  label: {
    type: String,
    default: '',
    required: true,
  },
})
</script>

<template>
  <div class="s-box">
    <div class="content flex justify-content-between align-items-center">
      <div class="label white-space-nowrap">{{ label }}</div>
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.s-box {
  background-color: var(--background);
  width: 100%;
  height: 50px;
  padding: 0 1.25rem;
  border: 1px solid var(--shade-400);
  margin-top: -1px;
  .content {
    width: 100%;
    height: 100%;
    font-size: 0.8125rem;
  }
  .label {
    font-size: 1rem;
  }
}
</style>
