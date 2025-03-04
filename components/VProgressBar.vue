<script setup lang="ts">
import { useIsRefreshing } from "~/composables/states"

const isRefreshing = useIsRefreshing()
</script>
<template>
  <ProgressBar
    v-if="isRefreshing"
    class="fixed w-full"
    mode="indeterminate"
    style="height: 2px; top: env(safe-area-inset-top); z-index: 5001"
  ></ProgressBar>
</template>
