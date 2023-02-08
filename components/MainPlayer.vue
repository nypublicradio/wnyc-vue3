<script setup>
import { useCurrentEpisodeHolder } from '~/composables/states'
import { useCurrentSteamStation } from '~/composables/states'
import { formatTime } from '~/utilities/helpers'

const currentSteamStation = useCurrentSteamStation()
const currentEpisodeHolder = useCurrentEpisodeHolder()

const currentEpisodeData = computed(
  () => currentEpisodeHolder.value?.data[0].attributes
)
const currentEpisodeImage = computed(
  () =>
    currentEpisodeHolder.value?.included.find(
      (include) => include.type === 'image'
    ).attributes
)
const currentEpisodeShow = computed(
  () =>
    currentEpisodeHolder.value?.included.find(
      (include) => include.type === 'show'
    ).attributes
)
const currentEpisodeTimes = computed(
  () =>
    currentEpisodeHolder.value?.included.find(
      (include) => include.type === 'show-schedule'
    ).attributes
)
</script>

<template>
  <div v-if="currentEpisodeHolder" class="card p-5">
    <div class="grid gap-3">
      <div class="w-full md:w-auto mx-auto flex flex-column align-items-center">
        <live-indicator
          :label="`${formatTime(
            currentEpisodeTimes['iso-start-time']
          )} - ${formatTime(currentEpisodeTimes['iso-end-time'])}`"
          class="mb-3 flex md:hidden"
        />
        <img
          :src="currentEpisodeImage?.url || currentEpisodeData?.['image-logo']"
          class="w-13rem md:w-14rem main-player-image"
        />
      </div>
      <div class="col">
        <live-indicator
          :label="`${formatTime(
            currentEpisodeTimes['iso-start-time']
          )} - ${formatTime(currentEpisodeTimes['iso-end-time'])}`"
          class="mb-3 hidden md:flex"
        />
        <h2 class="mb-3">{{ currentEpisodeShow?.title }}</h2>
        <p
          v-html="currentEpisodeShow?.tease"
          class="main-player-description mb-4"
        />
        <listen-live-button class="mt-" :slug="currentSteamStation" />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
