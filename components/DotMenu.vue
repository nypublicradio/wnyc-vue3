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
      :menu="true"
    />
  </div>
</template>
