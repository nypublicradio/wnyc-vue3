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
    <div class="latest-news-updates">Here</div>
  </div>
</template>

<style lang="scss" scoped>
.latest-news-updates {
}
</style>
