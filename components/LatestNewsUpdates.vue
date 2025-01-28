<script setup>
import { togglePlayEpisode } from "~/utilities/helpers"

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
          bagdeColor="var(--p-surface-0)"
          badgeBgColor="var(--p-indigo-500)"
          @onClick="togglePlayEpisode(props.nationalNewscast)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.latest-news-updates {
  .card-small {
    background-color: var(--p-surface-25);
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
