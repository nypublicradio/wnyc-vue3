<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
import { useBreakpoints } from "~/composables/useBreakpoints"
const props = defineProps({
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
})

const reactiveItems = toRef(props.list, "listItems")
const { breakpoint } = useBreakpoints()
const isLgBreakpoint = computed(() => breakpoint("<lg"))
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
          :isHorizontal="isLgBreakpoint"
          :allowVerticalEffect="true"
          imgCol="w-7rem md:w-11rem lg:w-full"
          :size="{
            xs: [112, 112],
            md: [176, 176],
            lg: [353, 235],
            xl: [437, 292],
          }"
          @on-click="dynamicNavigation(article)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in props.maxItems"
        :key="`skeleton-three-pack-${index}`"
        :class="props.cardClass"
        :isHorizontal="isLgBreakpoint"
        imgCol="w-7rem md:w-11rem lg:w-full"
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
