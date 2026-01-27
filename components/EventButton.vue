<script setup lang="ts">
import type { PropType } from "vue"

const props = defineProps({
  label: {
    type: String,
    default: "Get Tickets",
  },
  live: {
    type: Boolean,
    default: false,
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
  progress: {
    type: Number,
    default: 0,
  },
  /* file filed to match up agaist or, if playing a downloaded file, the directoryAudio.name to match up against */
  file: {
    default: "",
    type: String,
  },
  variant: {
    type: String as PropType<"default" | "hero">,
    default: "default",
  },
})

const emit = defineEmits(["on-click"])
</script>

<template>
  <div class="event-button" :class="[{ circle: props.label === '' }, `variant-${props.variant}`]">
    <Button
      severity="secondary"
      @click="emit('on-click')"
      aria-label="read this article"
      class="flex align-items-center cursor-pointer"
    >
      <slot name="icon">
        <div class="flex align-items-center icon">
          <i class="pi pi-ticket" />
        </div>
      </slot>
      <slot>
        <div class="content flex white-space-nowrap">
          <span>{{ props.label }}</span>
        </div>
      </slot>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.event-button {
  .p-button {
    border-radius: 999px;
    border: none;
    color: #ffffff;
    box-shadow: none;
    font-weight: var(--font-weight-700);
    gap: 6px;
  }
  .content {
    font-size: 14px;
    font-weight: var(--font-weight-700);
    line-height: 19px;
    align-items: center;
    gap: 6px;
    * {
      line-height: 1;
    }
  }

  /* Original ReadButton-style for MediaCard usage */
  &.variant-default {
    .p-button {
      padding: 0.219rem 0.75rem;
      min-height: 33px;
      background: var(--wnyc-logo-color);
    }
  }

  /* Hero pill button for event detail page */
  &.variant-hero {
    .p-button {
      padding: 9px 20px;
      min-height: 37px;
      background: var(--wnyc-logo-color);
      justify-content: center;
      transition: background var(--p-transition-duration);
      &:hover {
        background: var(--wnyc-logo-color-hover);
      }
    }
  }
}
</style>
