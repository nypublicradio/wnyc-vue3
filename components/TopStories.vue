<script setup>
import { usePrimeVue } from "primevue/config"

const props = defineProps({
  articles: {
    type: Array,
    default: null,
  },
})

// TEMP fix to make ripple work
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
</script>

<template>
  <div v-if="articles" class="top-stories">
    <div v-for="(article, index) in articles" :key="article.id" class="mb-5">
      <!--       <pre class="text-xs">{{ article.id }}</pre> -->
      <StoryItem :data="article" :index="index" />
    </div>
  </div>
  <div v-else>
    <skeleton-top-story
      class="skeleton-holder flex gap-3 mb-5"
      v-for="(article, index) in 6"
      :key="`skeleton-${index}`"
    />
  </div>
</template>

<style lang="scss">
.top-stories {
}
</style>
