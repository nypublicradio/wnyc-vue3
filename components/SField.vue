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
const error = ref(false)
let regex = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)

const onUpdate = (val) => {
  emit('update:data', val)
  console.log('val = ', val)
  if (props.email) {
    const isValid = regex.test(val)
    console.log('isValid = ', isValid)
    isValid ? (error.value = false) : (error.value = true)
  }
}
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
        @update:modelValue="onUpdate"
        :class="[{ 'p-invalid': error }]"
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
