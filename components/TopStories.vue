<script setup>
import { usePrimeVue } from "primevue/config"
import { hasAudio, goToEpisodePage, goToStoryPage } from "~/utilities/helpers"
import { isAlreadyDownloaded } from "~/utilities/file-system"
const props = defineProps({
  articles: {
    type: Array,
    default: null,
  },
  responsive: {
    type: Boolean,
    default: true,
  },
})

// TEMP fix to make ripple work
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
</script>

<template>
  <div v-if="articles" class="top-stories" :class="props.responsive ? 'grid' : ''">
    <div
      v-for="(article, index) in articles"
      :key="article.id"
      :class="props.responsive ? 'col-12 md:col-6 mb-3' : 'mb-5'"
    >
      <!-- <pre class="text-xs">{{ article.url }}</pre> -->
      <EpisodeItem
        v-if="hasAudio(article.audio)"
        :data="article"
        @on-click="goToEpisodePage(article)"
        :isDownloaded="isAlreadyDownloaded(article)"
      />
      <StoryItem
        v-else
        :data="article"
        :index="index"
        @on-click="goToStoryPage(article, { src: article.cmsSource })"
      />
    </div>
  </div>
  <div v-else :class="props.responsive ? 'grid' : ''">
    <skeleton-top-story
      class="skeleton-holder"
      :class="props.responsive ? 'col-12 md:col-6 mb-3' : 'mb-5'"
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
