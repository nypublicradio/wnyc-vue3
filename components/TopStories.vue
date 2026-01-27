<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
})

const reactiveArticles = toRef(props, "articles")
</script>

<template>
  <div>
    <div
      v-if="reactiveArticles?.length > 0"
      class="top-stories grid grid-nogutter gap-3"
    >
      <div
        v-for="(article, index) in reactiveArticles"
        :key="`${article?.id}-${index}`"
        :class="props.cardClass"
        class="w-full"
      >
        <MediaCard
          showTease
          isHorizontal
          imgCol="w-7rem md:w-11rem"
          :data="article"
          :size="{ xs: [112, 112], md: [176, 176] }"
          @on-click="dynamicNavigation(article)"
        />
      </div>
    </div>
    <div v-else class="grid">
      <div
        v-for="index in 4"
        :key="`skeleton-top-stories-${index}`"
        :class="props.cardClass"
      >
        <skeleton-media-card
          :key="`skeleton-1-${index}`"
          :class="props.cardClass"
          :size="{ xs: [112, 112], md: [176, 176] }"
        />
      </div>
    </div>
  </div>
</template>