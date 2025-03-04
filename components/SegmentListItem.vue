<script setup>
const props = defineProps({
  newWindow: {
    default: false,
    type: Boolean,
  },
  title: {
    default: null,
    type: String,
  },
  url: {
    default: null,
    type: String,
  },
})

const emit = defineEmits(["onClick"])
</script>
<template>
  <VFlexibleLink
    raw
    v-if="url"
    :to="url"
    :target="newWindow && '_blank'"
    class="segment-list-item"
    @click="emit('onClick', { url, title })"
  >
    <div class="segment-list-item-title">
      {{ title }}
    </div>
    <div class="segment-list-item-icon">
      <i class="pi pi-chevron-right"></i>
    </div>
  </VFlexibleLink>
  <div v-else class="segment-list-item">
    {{ title }}
  </div>
</template>

<style lang="scss" scoped>
.segment-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--stroke-toggle-color) !important;
  text-decoration: none;
  padding-top: 8px;
  padding-bottom: 8px;
  &:hover {
    text-decoration: none;
    .segment-list-item-icon {
      left: 10px;
    }
  }
  .segment-list-item-icon {
    position: relative;
    left: 0;
    transition: left 0.5s;
    -webkit-transition: left 0.5s;
  }
}
.segment-list-item .segment-list-item-title {
  width: 100%;
  padding-right: 1rem;
}
</style>
