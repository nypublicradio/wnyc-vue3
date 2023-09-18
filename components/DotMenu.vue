<script setup>
import { ref } from 'vue'

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
const emit = defineEmits(['update:data', 'changeEmit'])

const dropupMenuRef = ref(null)
</script>
<template>
  <div class="card flex justify-content-center">
    <!-- <Button
      class="text-cyan-500 hover:bg-cyan-50 relative"
      icon="pi pi-ellipsis-v"
      text
      rounded
      aria-label="menu"
      size="small"
      type="button"
      @click="dropupMenuRef.openMenu()"
      aria-haspopup="true"
      aria-controls="overlay_menu"
    /> -->
    <!-- <DropupMenu
      ref="dropupMenuRef"
      :menuItems="props.menuItems"
      :label="props.label"
    >
      <template #end>
        <slot name="end"></slot>
      </template>
    </DropupMenu> -->
    <DropupMenuNew
      v-model:data="props.menuItems"
      :options="props.menuItems"
      optionLabel="label"
      :label="props.label"
      @change="emit('changeEmit', $event)"
      menu
    />
  </div>
</template>
