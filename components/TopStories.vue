<script setup>
import VCard from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { cmsSources } from '~/composables/globals'
import { trackClickEvent, whenTime } from '~/utilities/helpers'
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
</script>

<template>
  <div v-if="articles" class="top-stories">
    <div v-for="(article, index) in articles" :key="article.id" class="mb-4">
      <!--   <pre class="text-xs">{{ article }}</pre> -->
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
