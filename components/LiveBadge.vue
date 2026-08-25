<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "LIVE",
  },
  bgColor: {
    type: String,
    default: "#f5f5f5",
  },
  fontSize: {
    type: String,
    default: "10px",
  },
  padding: {
    type: String,
    default: "1px 8px 1px 8px",
  },
})
</script>

<template>
  <div class="live-badge flex align-items-center relative">
    <LiveIndicator />
    <span>{{ props.label }}</span>
  </div>
</template>

<style lang="scss" scoped>
.live-badge {
  gap: 6px;
  background-color: v-bind(bgColor);
  border-radius: 2px;
  padding: v-bind(padding);
  font-size: v-bind(fontSize);
  color: var(--p-surface-950);
  line-height: normal;
  font-weight: var(--font-weight-600);
  letter-spacing: 1px;
  font-family: var(--font-family-header);
}
</style>
