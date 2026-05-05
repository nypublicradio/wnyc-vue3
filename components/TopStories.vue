<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
  headerTitle: {
    type: String,
    default: "Top Stories",
  },
})

const reactiveArticles = toRef(props, "articles")
</script>

<template>
  <div>
    reactiveArticles:
    <pre>{{ reactiveArticles }}</pre>
    <div
      v-if="reactiveArticles?.length > 0"
      class="top-stories flex flex-column gap-3"
    >
      <h2 class="mb-3">{{ props.headerTitle }}</h2>
      <div
        v-for="(article, index) in reactiveArticles"
        :key="`${article?.id}-${index}`"
        class=""
      >
        <MediaCard
          showTease
          isHorizontal
          imgCol="w-7rem md:w-12rem"
          :data="article"
          :size="{ xs: [112, 112], md: [192, 192] }"
          @on-click="dynamicNavigation(article)"
        />
      </div>
    </div>
    <div v-else class="flex flex-column gap-3">
      <Skeleton
        height="18px"
        width="45%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
      <div v-for="index in 4" :key="`skeleton-top-stories-${index}`">
        <skeleton-media-card
          isHorizontal
          imgCol="w-7rem md:w-12rem"
          :size="{ xs: [112, 112], md: [192, 192] }"
        />
      </div>
    </div>
  </div>
</template>