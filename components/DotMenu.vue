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
})
const dataRef = ref(props.label)
const emit = defineEmits(['changeEmit'])
</script>
<template>
  <div class="card flex justify-content-center">
    <DropupMenu
      v-model:data="dataRef"
      :options="props.menuItems"
      :label="props.label"
      @change="emit('changeEmit', $event)"
      :customButton="true"
    >
      <template #customButton="slotProps">
        <Button
          class="text-cyan-500 hover:bg-cyan-50"
          icon="pi pi-ellipsis-v"
          text
          rounded
          aria-label="menu"
          size="small"
          type="button"
          aria-haspopup="true"
          aria-controls="overlay_menu"
        />
      </template>
    </DropupMenu>
  </div>
</template>
