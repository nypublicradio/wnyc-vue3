<script setup>
import { useBreakpoints } from "~/composables/useBreakpoints"
import DropupMenuApp from "./DropupMenuApp.vue"
import DropupMenuWeb from "./DropupMenuWeb.vue"
const props = defineProps({
  options: {
    type: Array,
    default: null,
    required: true,
  },
  label: {
    type: String,
    default: null,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  startOpen: {
    type: Boolean,
    default: false,
  },
  checkMark: {
    type: Boolean,
    default: false,
  },
  initSelectedData: {
    type: String,
    default: null,
  },
  blockClick: {
    type: Boolean,
    default: false,
  },
  // the widest the popover can be
  contentClassPopover: {
    type: String,
    default: null,
  },
  // the widest the popover can be
  contentClassDrawer: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["change", "swipe-down"])
const { isMobileBreakpoint } = useBreakpoints()

// 2way binding to the currentUserProfile on the parent prop v-model
const vModel = defineModel()

// Pick component based on breakpoint
const DropupMenuComponent = computed(() => {
  return isMobileBreakpoint.value ? DropupMenuApp : DropupMenuWeb
})

// Reference to the child component
const menuRef = ref(null)

// Forward events from child component
const handleChange = (event) => {
  emit("change", event)
}
// Forward events from child component
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
    :label="props.label"
    :showTitle="props.showTitle"
    :startOpen="props.startOpen"
    :checkMark="props.checkMark"
    :initSelectedData="props.initSelectedData"
    :blockClick="props.blockClick"
    @change="handleChange"
    @swipe-down="handleSwipeDown"
    :contentClass="
      isMobileBreakpoint ? props.contentClassDrawer : props.contentClassPopover
    "
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
