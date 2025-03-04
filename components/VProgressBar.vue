<script setup lang="ts">
import { useIsStreamLoading } from "~/composables/states"

const isStreamLoading = useIsStreamLoading()
</script>
<template>
  <ProgressBar
    v-if="isStreamLoading"
    class="fixed w-full"
    mode="indeterminate"
    style="height: 2px; top: env(safe-area-inset-top); z-index: 5001"
  ></ProgressBar>
</template>
