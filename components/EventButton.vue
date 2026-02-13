<script setup lang="ts">
const props = defineProps({
  label: {
    type: String,
    default: "Get Tickets",
  },
  severity: {
    type: String,
    default: "secondary",
  },
  showIcon: {
    type: Boolean,
    default: false,
  },
  buttonClass: {
    type: String,
    default: "",
  },
  labelClass: {
    type: String,
    default: "",
  },
})

const emit = defineEmits(["on-click"])
</script>

<template>
  <div class="event-button" :class="[{ circle: props.label === '' }]">
    <Button
      :severity="props.severity"
      @click="emit('on-click')"
      aria-label="read this article"
      class="flex align-items-center cursor-pointer"
      :class="props.buttonClass"
    >
      <slot name="icon" v-if="props.showIcon">
        <div class="flex align-items-center icon">
          <i class="pi pi-ticket" />
        </div>
      </slot>
      <slot>
        <div :class="props.labelClass" class="content flex white-space-nowrap">
          <span>{{ props.label }}</span>
        </div>
      </slot>
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.event-button {
  .p-button {
    padding: 0.219rem 0.75rem;
    min-height: 33px;
    &.active {
      //border: var(--bw-toggle) 1px solid;
    }
  }
  .content {
    font-size: 14px;
    font-weight: var(--font-weight-700);
    line-height: normal;
    align-items: center;
    * {
      line-height: 1;
    }
  }
}
</style>