<script setup lang="ts">
import type { DocumentBlock } from "../../composables/types/StreamfieldBlock"

const props = defineProps<{
  block: DocumentBlock
}>()
</script>

<template>
  <div>
    {{ block }}
  </div>
</template>
