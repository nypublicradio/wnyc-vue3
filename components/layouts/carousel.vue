<script setup>
import { dynamicNavigation } from "~/utilities/helpers"

const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  maxItems: {
    type: Number,
    default: undefined,
  },
})

const reactiveItems = toRef(props.list, "listItems")
const getImgSizesBasedOnItemImgRatio = (item, obj) => {
  const imgHeight = Number(item.imageFullHeight || item.image?.height)
  const imgWidth = Number(item.imageFullWidth || item.image?.width)

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
      <MediaCard
        v-for="(item, index) in reactiveItems?.slice(0, props.maxItems)"
        :key="`carousel-${item.id}-${index}`"
        class="item"
        inCarousel
        showTease
        isVertical
        :data="item"
        :allowVerticalEffect="false"
        imgCol="h-12rem md:h-16rem lg:h-18rem"
        :size="
          getImgSizesBasedOnItemImgRatio(item, {
            xs: 192,
            md: 256,
            lg: 288,
          })
        "
        @on-click="dynamicNavigation(item)"
      />
    </MaterialCarouselBasic>
  </div>
</template>