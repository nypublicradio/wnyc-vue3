<script setup>
const props = defineProps({
  label: {
    type: String,
    default: null,
    required: true,
  },
  classNames: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <div :class="`badge ${props.classNames}`">
    <div class="content">{{ props.label }}</div>
  </div>
</template>

<style lang="scss" scoped>
.badge {
  text-transform: uppercase;
  font-family: var(--font-family);
  display: flex;
  .content {
    font-size: var(--font-size-2);
    padding: 1px 6px;
    border-radius: 2px;
    width: auto;
    font-weight: var(--font-weight-600);
    letter-spacing: 0.5px;
  }
}
.badge .content {
  color: var(--p-surface-950);
  background-color: var(--p-yellow-500);
}
.badge.news-card-badge .content {
  color: var(--p-surface-950);
  background-color: var(--p-yellow-500);
}
.badge.news-card-badge.local-news .content {
  color: var(--p-surface-950);
  background-color: var(--p-yellow-500);
}
.badge.news-card-badge.world-news .content {
  color: var(--p-surface-0);
  background-color: var(--p-indigo-500);
}
.badge.event-location-badge.in-person .content {
  color: var(--p-surface-0);
  background-color: var(--electric-violet);
}
.badge.event-location-badge.live-stream .content {
  color: var(--p-text-color);
  background-color: var(--sea-green);
}
.badge.event-type-badge .content {
  color: var(--p-text-color);
  background-color: var(--badge-background-event-type-badge);
}
</style>