<script setup>
const props = defineProps({
  label: {
    type: String,
    default: 'Tap to add',
  },
  password: {
    type: Boolean,
    default: false,
  },
  email: {
    type: Boolean,
    default: false,
  },
  data: {
    type: String,
  },
})

const emit = defineEmits(['update:data'])

const internalData = ref(props.data)
</script>
<template>
  <Inplace class="s-field">
    <template #display>
      {{ password ? label : internalData ?? label }}
    </template>
    <template #content>
      <InputText
        v-model="internalData"
        autofocus
        size="small"
        @update:modelValue="$emit('update:data', $event)"
      />
    </template>
  </Inplace>
</template>

<style lang="scss">
.s-field {
  .p-inplace-display:not(.p-disabled):hover {
    &:hover {
      background: var(--background3);
    }
  }
}
</style>
