<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  propVar: {
    type: Boolean,
    default: false,
  },
})

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
</script>

<template>
  <div>
    <div class="pipe-data">
      <div class="flex gap-1 flex-wrap">
        <slot name="left" />
        <div>|</div>
        <slot name="right" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pipe-data {
}
</style>
