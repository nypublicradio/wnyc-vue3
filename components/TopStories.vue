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
      class="top-stories flex flex-column gap-3"
    >
      <div
        v-for="(article, index) in reactiveArticles"
        :key="`${article?.id}-${index}`"
        :class="props.cardClass"
        class=""
      >
        <MediaCard
          showTease
          isHorizontal
          imgCol="w-7rem md:w-12rem"
          :data="article"
          :size="{ xs: [112, 112], md: [176, 176] }"
          @on-click="dynamicNavigation(article)"
        />
      </div>
    </div>
    <div v-else class="flex flex-column gap-3">
      <div
        v-for="index in 5"
        :key="`skeleton-top-stories-${index}`"
        :class="props.cardClass"
        class=""
      >
        <skeleton-media-card
          isHorizontal
          imgCol="w-7rem md:w-12rem"
          :size="{ xs: [112, 112], md: [176, 176] }"
        />
      </div>
    </div>
  </div>
</template>