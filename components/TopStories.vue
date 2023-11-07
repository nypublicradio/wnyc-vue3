<script setup>
import { usePrimeVue } from 'primevue/config'

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

// remove any duplicate publisher articles
const updatedArticles = ref(null)
watch(
  () => props.articles,
  () => {
    updatedArticles.value = props.articles.filter((obj, index) => {
      return index === props.articles.findIndex((o) => obj.title === o.title)
    })
  }
)
</script>

<template>
  <div v-if="updatedArticles" class="top-stories">
    <div
      v-for="(article, index) in updatedArticles"
      :key="article.id"
      class="mb-4"
    >
      <!-- <pre class="text-xs">{{ updatedArticles }}</pre> -->
      <Story :article="article" :index="index" />
    </div>
  </div>
  <div v-else>
    <skeleton-top-story
      class="skeleton-holder flex gap-3 mb-4"
      v-for="(article, index) in 6"
      :key="`skeleton-${index}`"
    />
  </div>
</template>

<style lang="scss">
.top-stories {
}
</style>
