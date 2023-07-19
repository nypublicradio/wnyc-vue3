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
    <section class="live-page">Live Page</section>
  </div>
</template>

<style lang="scss" scoped>
.live-page {
}
</style>
