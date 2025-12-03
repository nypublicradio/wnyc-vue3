<script setup lang="ts">
import type { PullQuoteBlock } from "~/composables/types/StreamfieldBlock"

const props = defineProps<{
  block: PullQuoteBlock
}>()
</script>

<template>
  <blockquote class="streamfield-pull-quote py-4">
    <h1>
      {{ block.value.pullQuote }}
    </h1>
    <p class="streamfield-pull-quote-author mt-3" v-if="author">
      {{ block.value.attribution }}
    </p>
  </blockquote>
</template>
