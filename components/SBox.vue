<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
const props = defineProps({
  label: {
    type: String,
    default: '',
    required: true,
  },
  link: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <div class="s-box" :class="[{ 'is-link': props.link }]">
    <div class="content flex justify-content-between align-items-center">
      <VFlexibleLink v-if="link" raw :to="link" class="w-full">
        <Button :label="label" class="w-full text-left" text />
      </VFlexibleLink>
      <div v-else class="label white-space-nowrap">{{ label }}</div>
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
  &.is-link {
    padding: 0;
    .flexible-link {
      .p-button {
        padding-left: 1.25rem;
        padding-right: 1.25rem;
        color: var(--night);
        font-weight: var(--font-weight-500);
        text-decoration: underline;
        &:hover {
          background: var(--background3);
        }
      }
    }
  }
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
