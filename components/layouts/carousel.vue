<script setup>
import { dynamicNavigation } from "~/utilities/helpers"

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  maxItems: {
    type: Number,
    default: 15,
  },
})

const reactiveItems = toRef(props.list, "listItems")

const getImgSizesBasedOnItemImgRatio = (item, obj) => {
  const imgHeight = Number(item.image?.height)
  const imgWidth = Number(item.image?.width)

  // Calcluate Aspect Ratio (Width / Height)
  let ratio = 1
  if (
    imgHeight &&
    imgWidth &&
    !isNaN(imgHeight) &&
    !isNaN(imgWidth) &&
    imgHeight !== 0
  ) {
    ratio = imgWidth / imgHeight
  }

  // Treat obj values as HEIGHT (user request), calculate WIDTH
  const sizeObj = {
    xs: obj.xs ? [Math.round(obj.xs * ratio), obj.xs] : undefined,
    md: obj.md ? [Math.round(obj.md * ratio), obj.md] : undefined,
    lg: obj.lg ? [Math.round(obj.lg * ratio), obj.lg] : undefined,
  }

  // Clean up undefined
  Object.keys(sizeObj).forEach(
    (key) => sizeObj[key] === undefined && delete sizeObj[key]
  )

  return sizeObj
}
</script>

<template>
  <div class="layout layout-carousel">
    <MaterialCarouselBasic :gap="16">
      <div
        v-for="(item, index) in reactiveItems?.slice(0, props.maxItems)"
        :key="`carousel-${item.id}-${index}`"
        class="item"
        style="height: -webkit-fill-available"
      >
        <MediaCard
          inCarousel
          showTease
          isVertical
          :data="item"
          :allowVerticalEffect="false"
          imgCol="h-12rem md:h-14rem lg:h-20rem"
          :size="
            getImgSizesBasedOnItemImgRatio(item, {
              md: 160,
              lg: 292,
            })
          "
          @on-click="dynamicNavigation(item)"
        />
      </div>
    </MaterialCarouselBasic>
  </div>
</template>
