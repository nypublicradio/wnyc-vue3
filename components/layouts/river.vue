<script setup>
import { dynamicNavigation, getRouteOrLink } from "~/utilities/helpers"
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 lg:col-6",
  },
  seeMore: {
    type: Object,
    required: false,
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-river">
    <LayoutsTitleHeader
      :label="props.label || props.list.title"
      :seeMore="props.seeMore"
    />
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
          :size="{ xs: [112, 112], md: [192, 192] }"
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
          :size="{ xs: [112, 112], md: [192, 192] }"
        />
      </div>
    </div>
  </div>
</template>
