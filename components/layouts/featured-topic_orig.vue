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
    default: 4,
  },
})

const reactiveItems = toRef(props.list, "listItems")
const { breakpoint } = useBreakpoints()
const isLgBreakpoint = computed(() => breakpoint("<lg"))
</script>

<template>
  <div class="layout layout-featured-topic">
    <div class="ad mb-5 col-12 flex align-items-center justify-content-center lg:hidden">
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
