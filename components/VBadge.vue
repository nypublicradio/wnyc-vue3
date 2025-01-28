<script setup>
const props = defineProps({
  label: {
    type: String,
    default: null,
    required: true,
  },
  bgColor: {
    type: String,
    default: 'var(--yellow)',
  },
  color: {
    type: String,
    default: 'var(--night-500)',
  },
})
</script>

<template>
  <div class="badge">
    <div class="content">{{ props.label }}</div>
  </div>
</template>

<style lang="scss" scoped>
.badge {
  text-transform: uppercase;
  font-family: var(--font-family);
  font-size: 10px;
  display: flex;
  .content {
    padding: 1px 6px;
    border-radius: 2px;
    color: v-bind(color);
    background-color: v-bind(bgColor);
    width: auto;
    font-weight: var(--font-weight-600);
    letter-spacing: -2%;
  }
}
</style>
