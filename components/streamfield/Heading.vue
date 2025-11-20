<script setup lang="ts">
import type { HeadingBlock } from "../../composables/types/StreamfieldBlock"

defineProps<{
  block: HeadingBlock
}>()
</script>

<template>
  <div class="streamfield-heading">
    <h2>{{ block.value }}</h2>
  </div>
</template>
