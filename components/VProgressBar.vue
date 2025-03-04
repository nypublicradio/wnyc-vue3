<script setup lang="ts">
import { useIsRefreshing, useIsStreamLoading } from "~/composables/states"

const isRefreshing = useIsRefreshing()
const isStreamLoading = useIsStreamLoading()

const statesToListenTo = computed(() => isRefreshing.value || isStreamLoading.value)
</script>
<template>
  <ProgressBar
    v-if="statesToListenTo"
    class="fixed w-full"
    mode="indeterminate"
    style="height: 2px; top: env(safe-area-inset-top); z-index: 5001"
  ></ProgressBar>
</template>
