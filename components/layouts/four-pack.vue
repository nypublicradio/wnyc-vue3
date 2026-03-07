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
    default: "col-12 md:col-12 lg:col-3 mb-3",
  },
  maxItems: {
    type: Number,
    default: 4,
  },
  scrolling: {
    type: Boolean,
    default: false,
  },
  scrollingMaxItems: {
    type: Number,
    default: 5,
  },
  gap: {
    type: String,
    default: null,
  },
  square: {
    type: Boolean,
    default: true,
  },
  seeMore: {
    type: Object,
    default: null,
    required: false,
  },
  isThin: {
    type: Boolean,
    default: false,
  },
})

const reactiveItems = toRef(props.list, "listItems")

const imgRatio = props.square ? [1, 1] : [3, 2]
// sets the height based on the imgRatio
const getImgSize = (width) => {
  const [w, h] = imgRatio
  return [width, Math.round(width * (h / w))]
}

const imgSizes = {
  xs: getImgSize(112),
  md: getImgSize(192),
  lg: getImgSize(props.isThin ? 371 : 261),
  xl: getImgSize(props.isThin ? 454 : 305),
  xxl: getImgSize(305),
}
const { breakpoint } = useBreakpoints()
const isLgBreakpoint = computed(() => breakpoint("<lg"))
</script>

<template>
  <div class="layout layout-four-pack">
    <LayoutsTitleHeader
      :label="props.label || props.list?.title"
      :seeMore="props.seeMore"
    />

    <div class="grid">
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(item, index) in reactiveItems.slice(0, props.maxItems)"
          :key="`${item.id}-${index}`"
          showTease
          teaseClasses="text-sm t2lines"
          :class="props.cardClass"
          :data="item"
          :size="imgSizes"
          :ratio="imgRatio"
          :isHorizontal="isLgBreakpoint"
          imgCol="w-7rem md:w-12rem lg:w-full"
          @on-click="dynamicNavigation(item)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in 4"
        :key="`skeleton-four-pack-${index}`"
        :class="props.cardClass"
        :size="imgSizes"
        :ratio="imgRatio"
        isVertical
      />
    </div>
  </div>
</template>
