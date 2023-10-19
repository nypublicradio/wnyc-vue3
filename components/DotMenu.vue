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
    default: '',
  },
  width: {
    type: String,
    default: '42px',
  },
  height: {
    type: String,
    default: '42px',
  },
})
const dataRef = ref(props.label)
const emit = defineEmits(['changeEmit'])
</script>
<template>
  <DropupMenu
    v-model:data="dataRef"
    :options="props.menuItems"
    :label="props.label"
    @change="emit('changeEmit', $event)"
    :customButton="true"
    :width="props.width"
    :height="props.height"
  >
    <template #customButton="slotProps">
      <Button
        class="text-cyan-500 hover:bg-cyan-50"
        icon="pi pi-ellipsis-v"
        text
        rounded
        aria-label="menu"
        :size="props.size"
        type="button"
        aria-haspopup="true"
        aria-controls="overlay_menu"
      />
    </template>
    <template #header="slotProps">
      <div class="style-mode-dark">
        <slot name="header-bottom" />
      </div>
    </template>
  </DropupMenu>
</template>
