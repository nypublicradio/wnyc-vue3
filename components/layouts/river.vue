<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12",
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-river">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div v-if="reactiveItems?.length > 0" class="grid">
      <div
        v-for="(article, index) in reactiveItems"
        :key="`${article.id}-${index}`"
        :class="props.cardClass"
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
    <div v-else class="grid">
      <div
        v-for="index in 4"
        :key="`skeleton-river-${index}`"
        :class="props.cardClass"
      >
        <skeleton-media-card
          isHorizontal
          imgCol="w-7rem md:w-12rem "
          class="w-full"
          :size="{ xs: [112, 112], md: [176, 176] }"
        />
      </div>
    </div>
  </div>
</template>
