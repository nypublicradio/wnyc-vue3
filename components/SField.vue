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
    default: null,
  },
})

const emit = defineEmits(['update:data', 'isValid'])

const internalData = ref(props.data)
const error = ref(false)
const regexEmailFormat = new RegExp(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
)

// triggered for ever key when the user types in the input field
const onUpdate = (val) => {
  emit('update:data', val)
  if (props.email) {
    const isValid = regexEmailFormat.test(val)
    isValid ? (error.value = false) : (error.value = true)
    emit('isValid', isValid)
  }
}
</script>
<template>
  <Inplace class="s-field">
    <template #display>
      {{ password ? label : internalData ?? label }}
    </template>
    <template #content>
      <div class="w-full">
        <InputText
          v-model="internalData"
          autofocus
          size="small"
          @update:modelValue="onUpdate"
          :class="[{ 'p-invalid': error }]"
        />
        <Transition name="zoom">
          <InlineMessage v-if="props.email && error" severity="error"
            >Invalid email</InlineMessage
          >
        </Transition>
      </div>
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
  .p-inline-message {
    pointer-events: none;
    position: absolute;
    width: 80%;
    right: -1rem;
    top: -47px;
  }
}
</style>
