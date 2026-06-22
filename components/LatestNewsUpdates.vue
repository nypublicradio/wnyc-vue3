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
      <div class="col-6 lg:col-12">
        <NewsCard
          :newsData="props.localNewscast"
          sourceLabel="WNYC"
          badgeLabel="NEW YORK NEWS"
          badgeClass="news-card-badge local-news"
          @onClick="togglePlayEpisode(props.localNewscast)"
        />
      </div>

      <div class="col-6 lg:col-12">
        <NewsCard
          :newsData="props.nationalNewscast"
          sourceLabel="NPR"
          badgeLabel="U.S. & WORLD NEWS"
          badgeClass="news-card-badge world-news"
          @onClick="togglePlayEpisode(props.nationalNewscast)"
        />
      </div>
    </div>
  </div>
</template>
