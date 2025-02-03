<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "LIVE",
  },
  bgColor: {
    type: String,
    default: "#ffffff",
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
  <div class="live-badge flex gap-2 align-items-center relative">
    <LiveIndicator />
    <span>{{ props.label }}</span>
  </div>
</template>

<style lang="scss" scoped>
.live-badge {
  background-color: v-bind(bgColor);
  border-radius: 2px;
  padding: v-bind(padding);
  font-size: v-bind(fontSize);
  color: var(--p-surface-950);
  line-height: normal;
}
</style>
