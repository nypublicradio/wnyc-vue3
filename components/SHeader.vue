<script setup>
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close-sidebar'])
</script>

<template>
  <div class="s-header">
    <div class="flex justify-content-between align-items-center">
      <div class="flex">
        <Button
          class="-ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          :aria-label="`${$props.pabel} sidebar close button`"
          @click="emit('close-sidebar')"
        />
        <h1>{{ props.label }}</h1>
      </div>
      <slot></slot>
    </div>
  </div>
</template>
