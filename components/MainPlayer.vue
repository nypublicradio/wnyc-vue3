<script setup>
import { useCurrentEpisodeHolder } from '~/composables/states'

const currentEpisodeHolder = useCurrentEpisodeHolder()
</script>

<template>
  <div class="main-player card p-5">
    <div v-if="currentEpisodeHolder" class="grid gap-3">
      <div class="w-full md:w-auto mx-auto flex flex-column align-items-center">
        <live-indicator
          :label="`${currentEpisodeHolder.timeStart} - ${currentEpisodeHolder.timeEnd}`"
          class="mb-3 flex md:hidden"
        />
        <img
          :src="currentEpisodeHolder.image"
          class="w-13rem md:w-14rem main-player-image"
        />
      </div>
      <div class="col py-0">
        <live-indicator
          :label="`${currentEpisodeHolder.timeStart} - ${currentEpisodeHolder.timeEnd}`"
          class="mb-3 hidden md:flex"
        />
        <h2 class="mb-3 title">{{ currentEpisodeHolder.title }}</h2>
        <p
          v-html="currentEpisodeHolder.details"
          class="main-player-description mb-4"
        />
        <listen-live-button class="mt-" :slug="currentEpisodeHolder.slug" />
      </div>
    </div>
    <div v-else class="loading">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
    </div>
  </div>
</template>

<style lang="scss">
.main-player {
  min-height: 280px;
  align-items: center;
  display: flex;
  .loading {
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
  }
  .title {
    font-weight: 600;
    font-size: var(--font-size-12);
  }
}
.main-player-image {
  width: 100%;
  height: auto;
  border-radius: 3px;
  border: 1px solid #ffffff20;
  object-fit: cover;
}

.main-player-description,
.main-player-description p {
  font-size: 1.125rem;
}

.track-info-livestream {
  height: 16px;
  line-height: 16px;
  display: flex;
  margin-bottom: 8px;
  .track-info-livestream-indicator {
    display: flex;
    align-items: center;
    background: var(--text-color);
    color: var(--black);
    border-radius: 3px;
    padding: 4px;
    margin-right: 8px;
    .track-info-livestream-indicator-text {
      font-size: 10px;
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 2px;
    }
    .track-info-livestream-indicator-dot {
      background-color: #e74f4f;
      border-radius: 8px;
      height: 8px;
      width: 8px;
    }
  }
  .track-info-livestream-station {
    font-family: var(--font-family);
    font-size: 12px;
    font-weight: 700;
  }
}
</style>
