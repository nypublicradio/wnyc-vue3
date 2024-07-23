<script setup>
import { togglePlayEpisode } from "~/utilities/helpers"

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
</script>

<template>
  <div>
    <!-- <pre class="text-xs">{{ props.localNewscast }}</pre> -->
    <div class="latest-news-updates grid">
      <div class="col-6">
        <NewsCard
          :newsData="props.localNewscast"
          sourceLabel="WNYC"
          badgeLabel="NEW YORK NEWS"
          @onClick="togglePlayEpisode(props.localNewscast)"
        />
      </div>

      <div class="col-6">
        <NewsCard
          :newsData="props.nationalNewscast"
          sourceLabel="NPR"
          badgeLabel="U.S. & WORLD NEWS"
          bagdeColor="var(--background-500)"
          badgeBgColor="var(--indigo-500)"
          @onClick="togglePlayEpisode(props.nationalNewscast)"
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
