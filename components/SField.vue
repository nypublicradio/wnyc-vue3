<script setup>
const props = defineProps({
  label: {
    type: String,
    default: "Tap to add",
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
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["update:data", "isValid", "submit", "onDisabled"])

const internalData = ref(props.data)
const error = shallowRef(false)
const regexEmailFormat = new RegExp(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)

// triggered for ever key when the user types in the input field
const onUpdate = (val) => {
  //emit('update:data', val)
  if (props.email) {
    const isValid = regexEmailFormat.test(val)
    isValid ? (error.value = false) : (error.value = true)
    emit("isValid", isValid)
  }
}

// triggered when the user clicks the submit button. closes the inplace component
const onSubmit = () => {
  const closeBtn = document.querySelectorAll(
    ".s-field .p-inplace-content .p-button-icon-only"
  )
  for (let i = 0; i < closeBtn.length; i++) closeBtn[i].click()
  emit("update:data", internalData.value)
  emit("submit", internalData.value)
}
// triggered when the user clicks the inplace component. emits the onDisabled event if it is disabled
const handleDisabledEmit = () => {
  if (props.disabled) {
    emit("onDisabled")
  }
}
</script>

<template>
  <Inplace
    class="s-field"
    :closable="true"
    :disabled="props.disabled"
    @click="handleDisabledEmit"
  >
    <template #display>
      {{ props.password ? label : internalData ?? label }}
    </template>
    <template #content>
      <div class="w-full">
        <InputText
          v-model="internalData"
          autofocus
          size="small"
          @update:modelValue="onUpdate"
          :placeholder="props.password ? 'New password' : ''"
          :class="[{ 'p-invalid': error }]"
        />
        <Transition name="zoom">
          <InlineMessage v-if="props.email && error" severity="error"
            >Invalid email</InlineMessage
          >
        </Transition>
      </div>
      <Button
        class="submit-btn"
        label="Submit"
        size="small"
        aria-label="submit"
        @click="onSubmit"
      />
    </template>
  </Inplace>
</template>

<style lang="scss">
.s-field {
  position: relative;
  .p-inplace-display:not(.p-disabled):hover {
    &:hover {
      background: var(--background3);
      color: var(--text-color);
    }
  }
  .p-inputtext {
    color: var(--text-color);
    background: var(--background2);
  }
  .p-inline-message {
    pointer-events: none;
    position: absolute;
    width: 80%;
    right: -1rem;
    top: -47px;
  }
  .submit-btn {
    position: absolute;

    width: 80px;
    right: 0;
    bottom: 0;
    top: 0;
    left: -80px;
  }
  .p-button {
    border-radius: 8px;
  }
}
</style>
