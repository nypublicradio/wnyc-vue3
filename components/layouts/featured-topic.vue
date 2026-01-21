<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
import { useBreakpoints } from "~/composables/useBreakpoints"
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
const { breakpoint } = useBreakpoints()
const isLgBreakpoint = computed(() => breakpoint("<lg"))

const getImgSizesBasedOnItemImgRatio = (item, obj) => {
  // console.log("item =   ", item)
  const imgHeight = Number(item.image?.height)
  const imgWidth = Number(item.image?.width)
  // console.log("imgWidth =   ", imgWidth)
  // console.log("imgHeight =   ", imgHeight)

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

  // Filter undefined keys if needed, but template usually passes valid ones or specific ones.
  // The original returned partial object if keys existed?
  // Original code:
  // xs: [obj.xs, Math.round(obj.xs * ratio)]  <-- implies obj.xs exists or is undefined loops
  // If obj.xs is undefined, math is NaN.

  // Let's keep it safe.
  // Also note: The template usage passes: { md: 176, lg: 320 }. xs is missing.
  // Original code would result in xs: [undefined, NaN] which might be bad.
  // Current refactor handles it by check.

  // Clean up undefined
  Object.keys(sizeObj).forEach(
    (key) => sizeObj[key] === undefined && delete sizeObj[key]
  )

  //console.log("sizeObj =   ", sizeObj)

  return sizeObj
}
</script>

<template>
  <div class="layout layout-featured-topic">
    <div
      class="ad mb-5 col-12 flex align-items-center justify-content-center lg:hidden"
    >
      <story-htlAd
        layout="rectangle"
        slotClass="htlad-wnyc_homepage_rectangle"
        fineprint="WNYC is funded by sponsors and member donations"
      />
    </div>
    <div class="grid">
      <h2 class="col-12 mb-4 order-2 lg:order-1">{{ props.list?.title }}</h2>
      <MediaCard
        v-if="reactiveItems?.length > 0"
        class="col-12 lg:col-8 mb-3 hidden md:block"
        titleClasses="t7lines"
        :data="reactiveItems[0]"
        is-horizontal
        is-feature
        showTease
        imgCol="w-8"
        :size="{ xs: [369, 246], sm: [592, 380], lg: [592, 480] }"
        @on-click="dynamicNavigation(reactiveItems[0])"
      />
      <skeleton-media-card
        v-else
        class="col-12 lg:col-8 mb-3 hidden md:block"
        is-horizontal
        is-feature
        imgCol="w-8"
        :size="{ xs: [369, 246], sm: [592, 395] }"
      />

      <div
        class="ad col-12 lg:col align-items-center justify-content-center hidden lg:flex"
      >
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>

      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems?.slice(0, props.maxItems)"
          :key="`${article.id}-${index}`"
          showTease
          class="col-12 lg:col-4 mb-3 order-4"
          :class="{ 'md:hidden': index === 0 }"
          :data="article"
          :isHorizontal="isLgBreakpoint"
          imgCol="w-7rem md:w-11rem lg:w-full"
          :size="{ xs: [112, 112], md: [176, 176], lg: [438, 292] }"
          @on-click="dynamicNavigation(article)"
        />
      </template>
      <div v-else class="w-full">
        <skeleton-media-card
          v-for="index in props.maxItems"
          :key="`skeleton-${index}`"
          class="col-12 lg:col-4 mb-3 order-4"
          :isHorizontal="isLgBreakpoint"
          imgCol="w-7rem md:w-11rem lg:w-full"
          :class="{ 'md:hidden': index === 1 }"
          :size="{ xs: [112, 112], md: [176, 176], lg: [438, 292] }"
        />
      </div>
    </div>
    <!-- <pre>{{ reactiveItems }}</pre> -->
    <MaterialCarouselBasic
      :enableThrow="true"
      :items-to-show="2"
      :min-content-width="180"
      :gap="16"
    >
      <div
        v-for="(item, index) in reactiveItems?.slice(0, props.maxItems)"
        :key="`carousel-${item.id}-${index}`"
        class="item"
        style="
          height: -webkit-fill-available;
          border-radius: var(--media-card-border-radius);
        "
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
              xs: 192,
              md: 224,
              lg: 320,
            })
          "
          :minContentWidth="180"
          style="height: -webkit-fill-available"
          @on-click="dynamicNavigation(item)"
        />
      </div>
    </MaterialCarouselBasic>
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);
.layout-featured-topic {
  .ad {
    min-width: 300px;
  }
}
</style>
