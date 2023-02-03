<script setup lang="ts">
import { useCurrentSteamStation } from '~/composables/states'
const currentSteamStation = useCurrentSteamStation()
</script>

<template>
  <section class="py-8">
    <h1 class="py-8">now playing: {{ currentSteamStation }}</h1>
    <div class="grid">
      <div class="col-8">
        <main-player />
      </div>
      <div class="col-4">
        <div class="ad p-5 ml-4">Ad Goes here</div>
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.ad {
  background-color: #ccc;
  height: 250px;
  border-radius: 6px;
  color: black;
}
</style>
