<script setup>
const props = defineProps({
  label: {
    type: String,
    default: null,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  severity: {
    type: String,
    default: "secondary",
  },
  menuItems: {
    type: Object,
    default: null,
    required: true,
  },
  size: {
    type: String,
    default: "",
  },
  isText: {
    type: Boolean,
    default: true,
  },
  checkMark: {
    type: Boolean,
    default: false,
  },
  initSelectedData: {
    type: String,
    default: null,
  },
  // classes for the content in the desktop popover
  contentClassPopover: {
    type: String,
    default: null,
  },
  // classes for the content in the mobile drawer
  contentClassDrawer: {
    type: String,
    default: null,
  },
})
const dataRef = ref(props.label)
const emit = defineEmits(["changeEmit"])
</script>
<template>
  <DropupMenu
    v-model:data="dataRef"
    :options="props.menuItems"
    :label="props.label"
    :showTitle="props.showTitle"
    :checkMark="props.checkMark"
    :initSelectedData="props.initSelectedData"
    :contentClassPopover="props.contentClassPopover"
    :contentClassDrawer="props.contentClassDrawer"
    @change="emit('changeEmit', $event)"
  >
    <template #customButton="slotProps">
      <slot name="myCustomButton" label="">
        <Button
          class="rounded"
          :class="{ 'p-button-text': props.isText }"
          :severity="props.severity"
          icon="pi pi-ellipsis-v"
          rounded
          aria-label="options menu"
          :size="props.size"
          type="button"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        />
      </slot>
    </template>
    <template #header="slotProps">
      <div>
        <slot name="header-bottom" />
      </div>
    </template>
  </DropupMenu>
</template>
