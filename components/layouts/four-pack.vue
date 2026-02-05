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
    default: "col-12 md:col-12 lg:col-3",
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
  md: getImgSize(176),
  lg: getImgSize(261),
  xl: getImgSize(305),
}
const { breakpoint } = useBreakpoints()
const isLgBreakpoint = computed(() => breakpoint("<lg"))
</script>

<template>
  <div class="layout layout-four-pack">
    <h2 class="mb-4">{{ props.list.title }}</h2>

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
          imgCol="w-7rem md:w-11rem lg:w-full"
          :allowVerticalEffect="!props.square"
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
      />
    </div>
  </div>
</template>
