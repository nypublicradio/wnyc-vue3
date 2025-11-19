<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 md:col-6 lg:col-4 mb-3",
  },
  maxItems: {
    type: Number,
    default: 3,
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-three-pack">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div class="grid">
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems.slice(0, props.maxItems)"
          :key="`${article.id}-${index}`"
          showTease
          :class="props.cardClass"
          :data="article"
          :size="{
            xs: [112, 112],
            md: [423, 290],
            lg: [353, 235],
            xl: [437, 292],
          }"
          @on-click="dynamicNavigation(article)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in 4"
        :key="`skeleton-1-${index}`"
        :class="props.cardClass"
        :size="{
          xs: [112, 112],
          md: [423, 290],
          lg: [261, 174],
          xl: [324, 216],
        }"
      />
    </div>
  </div>
</template>
