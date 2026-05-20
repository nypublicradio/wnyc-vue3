<script setup>
import { useBreakpoints } from "~/composables/useBreakpoints"
import { mediaTypes } from "~/composables/globals"
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  list: {
    type: Object,
    required: true,
  },
  maxItems: {
    type: Number,
    default: 4,
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

// Compute isSquare synchronously during setup so it runs during SSR
// (onBeforeMount does NOT run on the server, causing hydration mismatches)
const isSquare = ref(false)
const featureItem = reactiveItems.value?.[0]
if (featureItem) {
  const imgHeight = Number(featureItem.imageFullHeight || featureItem.image?.height)
  const imgWidth = Number(featureItem.imageFullWidth || featureItem.image?.width)
  if (featureItem.cmsSource === mediaTypes.SIMPLECAST) {
    isSquare.value = true
  } else if (
    imgHeight &&
    imgWidth &&
    !isNaN(imgHeight) &&
    !isNaN(imgWidth) &&
    imgHeight !== 0
  ) {
    isSquare.value = imgHeight === imgWidth
  }
}

const squareSizes = {
  md: [443, 443],
}

const rectSizes = {
  md: [443, 295],
}

const featureSizes = computed(() => {
  return isSquare.value ? squareSizes : rectSizes
})
</script>

<template>
  <div class="layout layout-horizontal-feature-ad">
    <div class="ad mb-5 col-12 flex align-items-center justify-content-center lg:hidden">
      <story-htlAd
        layout="rectangle"
        slotClass="htlad-wnyc_homepage_rectangle"
        fineprint="WNYC is funded by sponsors and member donations"
      />
    </div>
    <div class="grid">
      <LayoutsTitleHeader
        class="col-12 order-2 lg:order-1 -mb-3"
        :label="props.label || props.list?.title"
        :seeMore="props.seeMore"
      />
      <MediaCard
        v-if="reactiveItems?.length > 0"
        class="col-12 lg:col-8 hidden md:block"
        titleClasses="t7lines"
        :data="reactiveItems[0]"
        is-horizontal
        is-feature
        showTease
        imgCol="w-6"
        :size="featureSizes"
        :allowVerticalEffect="!isSquare"
        :loading="props.loading"
      />
      <skeleton-media-card
        v-else
        class="col-12 lg:col-8 mb-3 hidden md:block"
        is-horizontal
        is-feature
        imgCol="w-6"
        :size="{
          md: [443, 443],
        }"
      />

      <div
        class="ad col-12 lg:col align-items-center justify-content-center hidden lg:flex px-0"
      >
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
      <!-- <pre class="text-xs">{{ reactiveItems }}</pre> -->
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems?.slice(0, props.maxItems)"
          :key="`${article.id}-${index}`"
          showTease
          teaseClasses="text-sm t2lines"
          class="col-12 lg:col-4 order-4"
          :class="{ 'md:hidden': index === 0 }"
          :data="article"
          :isHorizontal="isLgBreakpoint"
          imgCol="w-7rem md:w-12rem lg:w-full"
          :size="{ xs: [112, 112], md: [192, 192], lg: [412, 275] }"
          :loading="props.loading"
        />
      </template>
      <div v-else class="w-full">
        <skeleton-media-card
          v-for="index in props.maxItems"
          :key="`skeleton-horizontal-feature-ad-${index}`"
          class="col-12 lg:col-4 mb-3 order-4"
          :isHorizontal="isLgBreakpoint"
          imgCol="w-7rem md:w-12rem lg:w-full"
          :class="{ 'md:hidden': index === 1 }"
          :size="{ xs: [112, 112], md: [192, 192], lg: [412, 275] }"
        />
      </div>
    </div>
    <!-- <pre>{{ reactiveItems }}</pre> -->
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);
.layout-horizontal-feature-ad {
  .ad {
    width: 100%;
    .ad-wrapper {
      width: 100%;
      max-width: 300px;
    }
  }
}
</style>
