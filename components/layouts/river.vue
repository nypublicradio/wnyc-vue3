<script setup>
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 mb-3",
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-river">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div class="grid">
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems"
          :key="`${article.id}-${index}`"
          showTease
          isHorizontal
          imgCol="w-8rem"
          :class="props.cardClass"
          :data="article"
          :size="{ xs: [112, 112] }"
          @on-click="dynamicNavigation(article)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in 4"
        :key="`skeleton-1-${index}`"
        :class="props.cardClass"
        :size="{ xs: [112, 112] }"
      />
    </div>
  </div>
</template>
