<script setup>
import { useIsApp } from "~/composables/states"

const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  optionLabel: {
    type: String,
    default: "label",
  },
  label: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    default: "Select",
  },
  width: {
    type: String,
    default: "40px",
  },
  height: {
    type: String,
    default: "40px",
  },
  startOpen: {
    type: Boolean,
    default: false,
  },
  checkMark: {
    type: Boolean,
    default: false,
  },
  blockClick: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["change", "swipe-down"])
const isApp = useIsApp()

// 2way binding to the currentUserProfile on the parent prop v-model
const vModel = defineModel()

// Dynamic component import based on environment
// This ensures code splitting - web users never load the APP code
const DropupMenuComponent = computed(() => {
  return isApp.value
    ? defineAsyncComponent(() => import("./DropupMenuApp.vue"))
    : defineAsyncComponent(() => import("./DropupMenuWeb.vue"))
})

// Reference to the child component
const menuRef = ref(null)

// Forward events from child component
const handleChange = (event) => {
  emit("change", event)
}

const handleSwipeDown = () => {
  emit("swipe-down")
}

// Expose methods for external access (maintains API compatibility)
defineExpose({
  closeMenu: (event) => menuRef.value?.closeMenu(event),
  toggleMenu: (event) => menuRef.value?.toggleMenu(event),
})
</script>
<template>
  <component
    :is="DropupMenuComponent"
    ref="menuRef"
    v-model="vModel"
    :options="props.options"
    :optionLabel="props.optionLabel"
    :label="props.label"
    :placeholder="props.placeholder"
    :width="props.width"
    :height="props.height"
    :startOpen="props.startOpen"
    :checkMark="props.checkMark"
    :blockClick="props.blockClick"
    @change="handleChange"
    @swipe-down="handleSwipeDown"
  >
    <template v-if="$slots.customButton" #customButton="slotProps">
      <slot name="customButton" v-bind="slotProps" />
    </template>
    <template v-if="$slots.header" #header="slotProps">
      <slot name="header" v-bind="slotProps" />
    </template>
    <template v-if="$slots.footer" #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>
  </component>
</template>

<style lang="scss">
@mixin checkMark {
  &:after {
    font-family: primeicons;
    content: "\e909";
    position: absolute;
    top: 0;
    bottom: 0;
    margin: auto;
    right: 20px;
    width: 1rem;
    height: 1rem;
    color: #ffffff;
  }
}
</style>
