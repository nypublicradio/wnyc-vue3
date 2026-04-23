<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
import { useBreakpoints } from "~/composables/useBreakpoints"
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
    default: "col-12 md:col-12 lg:col-4",
  },
  maxItems: {
    type: Number,
    default: 3,
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
})

const reactiveItems = toRef(props.list, "listItems")
const { breakpoint } = useBreakpoints()
const isLgBreakpoint = computed(() => breakpoint("<lg"))
</script>

<template>
  <div class="layout layout-three-pack">
    <LayoutsTitleHeader
      :label="props.label || props.list.title"
      :seeMore="props.seeMore"
    />

    <div class="grid">
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems.slice(0, props.maxItems)"
          :key="`${article.id}-${index}`"
          showTease
          :class="props.cardClass"
          :data="article"
          :isHorizontal="isLgBreakpoint"
          :allowVerticalEffect="!isLgBreakpoint"
          imgCol="w-7rem md:w-12rem lg:w-full"
          :size="{
            xs: [112, 112],
            md: [176, 176],
            lg: [353, 235],
            xl: [437, 292],
          }"
          :loading="props.loading"
          @on-click="dynamicNavigation(article)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in props.maxItems"
        :key="`skeleton-three-pack-${index}`"
        :class="props.cardClass"
        :isHorizontal="isLgBreakpoint"
        imgCol="w-7rem md:w-12rem lg:w-full"
        :size="{
          xs: [112, 112],
          md: [176, 176],
          lg: [261, 174],
          xl: [324, 216],
        }"
      />
    </div>
  </div>
</template>
