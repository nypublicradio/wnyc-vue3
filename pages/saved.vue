<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
</script>

<template>
  <div>
    <div class="saved-page">Saved Page</div>
  </div>
</template>

<style lang="scss" scoped>
.saved-page {
}
</style>
