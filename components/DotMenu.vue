<script setup>
import { ref } from 'vue'

const props = defineProps({
  items: {
    type: Object,
    default: null,
    required: true,
  },
  data: {
    type: Object,
    default: null,
    required: true,
  },
})

const menu = ref()

const toggle = (event) => {
  menu.value.toggle(event)
}
</script>
<template>
  <div class="card flex justify-content-center">
    <Button
      class="text-cyan-500 hover:bg-cyan-50 relative"
      icon="pi pi-ellipsis-v"
      text
      rounded
      aria-label="menu"
      size="small"
      type="button"
      @click="toggle"
      aria-haspopup="true"
      aria-controls="overlay_menu"
    />
    <Menu ref="menu" id="dots-overlay_menu" :model="props.items" :popup="true">
      <!-- <template #item="{ item, label, props }">
        <slot name="item" :props="props" :label="label" />
      </template> -->
      <template #end>
        <slot name="end"></slot>
      </template>
    </Menu>
  </div>
</template>

<style lang="scss">
#dots-overlay_menu * {
  background: transparent;
  .p-menuitem-content:hover {
    background: var(--background2) !important;
  }
}
</style>
