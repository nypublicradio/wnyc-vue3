<script setup>
import { trackClickEvent } from "~/utilities/helpers"
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
const togglePlay = (media) => {
  if (currentEpisode.value?.file !== media.file) {
    currentEpisode.value = media
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent("Click Tracking - Latest News Updates", media.title, "toggle play")
}
</script>

<template>
  <div>
    <div class="latest-news-updates grid">
      <div class="col-6">
        <NewsCard
          :newsData="props.localNewscast"
          @onClick="togglePlay(props.localNewscast)"
        />
      </div>

      <div class="col-6">
        <NewsCard
          :newsData="props.nationalNewscast"
          source="NPR"
          badgeLabel="National News"
          bagdeColor="var(--background-500)"
          badgeBgColor="var(--indigo-500)"
          @onClick="togglePlay(props.nationalNewscast)"
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
