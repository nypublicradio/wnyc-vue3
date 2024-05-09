<script setup>
const props = defineProps({
  label: {
    type: String,
    default: null,
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
  width: {
    type: String,
    default: "42px",
  },
  height: {
    type: String,
    default: "42px",
  },
  customButton: {
    type: Boolean,
    default: true,
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
    @change="emit('changeEmit', $event)"
    :customButton="props.customButton"
    :width="props.width"
    :height="props.height"
  >
    <template #customButton="slotProps">
      <slot name="myCustomButton" label="">
        <Button
          class="text-cyan-500 hover:bg-cyan-50 rounded"
          icon="pi pi-ellipsis-v"
          text
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
      <div class="style-mode-dark">
        <slot name="header-bottom" />
      </div>
    </template>
  </DropupMenu>
</template>

<style lang="scss" scoped>
.p-dropdown {
  border-radius: 50%;
}
</style>
