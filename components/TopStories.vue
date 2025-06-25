<script setup>
import { hasAudio, goToEpisodePage, goToStoryPage } from "~/utilities/helpers"

const props = defineProps({
  articles: {
    type: Array,
    default: null,
  },
})
</script>

<template>
  <div v-if="articles" class="top-stories grid">
    <div class="col-12 mb-3">
      <MediaCard :data="articles[0]" is-horizontal is-feature imgCol="w-6" />
    </div>
    <div
      v-for="(article, index) in articles.slice(1)"
      :key="article.id"
      class="col-12 md:col-4 mb-3"
    >
      <MediaCard :data="article" />
    </div>
  </div>
  <div v-else class="grid">
    <skeleton-top-story
      class="skeleton-holder col-12 md:col-6 mb-3"
      v-for="(article, index) in 6"
      :key="`skeleton-${index}`"
    />
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);
.top-stories {
}
</style>
