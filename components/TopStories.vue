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
    <MediaCard
      class="col-12 lg:col-8 mb-3"
      :data="articles[0]"
      is-horizontal
      is-feature
      imgCol="w-8"
    />

    <div class="col mb-3 hidden lg:flex">AD HERE</div>

    <MediaCard
      v-for="(article, index) in articles.slice(1)"
      :key="article.id"
      class="col-12 md:col-4 mb-3"
      :data="article"
    />

    <MediaCard
      class="col-12 lg:col-6 mb-3"
      :data="articles[0]"
      is-vertical
      is-feature
      :img-width="672"
      :img-height="444"
    />

    <div class="col-12 lg:col-6 grid">
      <MediaCard
        v-for="(article, index) in articles.slice(1)"
        :key="article.id"
        class="col-12 mb-3"
        :data="article"
        is-horizontal
        is-event
        imgCol="w-6"
        :img-width="320"
        :img-height="150"
      />
    </div>
  </div>
  <div class="col-12 lg:col-6 grid">
    <skeleton-media-card
      v-for="(article, index) in articles.slice(1)"
      :key="`skeleton-${index}`"
      class="col-12 mb-3"
      :data="article"
      is-horizontal
      is-event
      imgCol="w-6"
      :img-width="320"
      :img-height="150"
    />
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);
.top-stories {
}
</style>
