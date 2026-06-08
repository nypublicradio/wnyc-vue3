<script setup>

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
    default: null,
    required: false,
  },
  loading: {
    type: String,
    default: "lazy",
  },
  enableLoadMore: {
    type: Boolean,
    default: false,
  },
  initialLimit: {
    type: Number,
    default: 15,
  },
  limitIncrement: {
    type: Number,
    default: 15,
  },
  loadMoreLabel: {
    type: String,
    default: "Load More",
  },
})

const emit = defineEmits(["load-more"])
const reactiveItems = toRef(props.list, "listItems")
const visibleCount = ref(props.initialLimit)

watch(
  () => props.list?.listItems,
  () => {
    visibleCount.value = props.initialLimit
  }
)

const visibleItems = computed(() => {
  const items = reactiveItems.value || []
  return props.enableLoadMore ? items.slice(0, visibleCount.value) : items
})

const hasMoreItems = computed(
  () => props.enableLoadMore && (reactiveItems.value?.length || 0) > visibleItems.value.length
)

const loadMore = () => {
  visibleCount.value += props.limitIncrement
  emit("load-more")
}
</script>

<template>
  <div class="layout layout-river">
    <LayoutsTitleHeader
      :label="props.label || props.list.title"
      :seeMore="props.seeMore"
    />
    <div v-if="reactiveItems?.length > 0" class="grid">
      <div
        v-for="(article, index) in visibleItems"
        :key="`${article.id}-${index}`"
        :class="props.cardClass"
      >
        <MediaCard
          showTease
          isHorizontal
          imgCol="w-7rem md:w-12rem"
          :data="article"
          :size="{ xs: [112, 112], md: [192, 192] }"
          :allowVerticalEffect="false"
          :loading="props.loading"
        />
      </div>
    </div>
    <div v-if="hasMoreItems" class="flex justify-content-center mt-5">
      <Button
        :label="props.loadMoreLabel"
        severity="secondary"
        class="px-5"
        @click="loadMore"
      />
    </div>
    <div v-if="!reactiveItems?.length" class="grid">
      <div v-for="index in 4" :key="`skeleton-river-${index}`" :class="props.cardClass" v-once>
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
