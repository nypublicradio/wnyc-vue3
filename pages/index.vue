<script setup lang="ts">
import { useCurrentSteamStation } from '~/composables/states'
import ListenLiveButton from '~/components/ListenLiveButton.vue'

const currentSteamStation = useCurrentSteamStation()
</script>
<template>
  <section class="py-8">
    <ListenLiveButton class="mt-4" :slug="currentSteamStation" />
    <h1 class="py-8">helloooo</h1>
  </section>
</template>

<style lang="scss"></style>
