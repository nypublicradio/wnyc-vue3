<script setup lang="ts">
import { useCurrentSteamStation } from '~/composables/states'

const currentSteamStation = useCurrentSteamStation()
</script>
<template>
  <section class="py-8">
    <h1 class="py-8">helloooo</h1>
    <listen-live-button class="mt-4" :slug="currentSteamStation" />
  </section>
</template>

<style lang="scss"></style>
