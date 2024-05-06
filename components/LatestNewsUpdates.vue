<script setup>
import { saveRecentlyPlayed } from "~/utilities/helpers"
import { useTogglePlayTrigger, useCurrentEpisode } from "~/composables/states"

// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

const props = defineProps({
  localNewscast: {
    type: Object,
    default: null,
  },
  nationalNewscast: {
    type: Object,
    default: null,
  },
})

const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

// handles play button click that updates the currentEpisode if it is a different file and togglePlayTrigger states
const togglePlayHere = (media) => {
  if (currentEpisode.value?.file !== media.file) {
    currentEpisode.value = media
    saveRecentlyPlayed(media, mediaTypes.EPISODE)
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
}
</script>

<template>
  <div>
    <!-- <pre class="text-xs">{{ props.localNewscast }}</pre> -->
    <div class="latest-news-updates grid">
      <div class="col-6">
        <NewsCard
          :newsData="props.localNewscast"
          sourceLabel="WNYC"
          badgeLabel="From WNYC"
          @onClick="togglePlayHere(props.localNewscast)"
        />
      </div>

      <div class="col-6">
        <NewsCard
          :newsData="props.nationalNewscast"
          sourceLabel="NPR"
          badgeLabel="From NPR"
          bagdeColor="var(--background-500)"
          badgeBgColor="var(--indigo-500)"
          @onClick="togglePlayHere(props.nationalNewscast)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.latest-news-updates {
  .card-small {
    background-color: var(--background2);
    padding: 10px;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    cursor: pointer;
    .news-title {
      font-size: 0.813rem;
    }
  }
}
</style>
