<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
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
</script>

<template>
  <div class="layout layout-featured-topic">
    <div class="ad col mb-3 flex align-items-center lg:hidden justify-content-center">
      <story-htlAd
        layout="rectangle"
        slotClass="htlad-wnyc_homepage_rectangle"
        fineprint="WNYC is funded by sponsors and member donations"
      />
    </div>
    <h2 class="mb-4">{{ props.list?.title }}</h2>
    <div class="grid">
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
        class="col-12 lg:col-8 mb-3"
        is-horizontal
        is-feature
        imgCol="w-8"
        :size="{ xs: [369, 246], sm: [592, 395] }"
      />

      <div class="ad col mb-3 hidden lg:flex align-items-center justify-content-center">
        <story-htlAd
          layout="rectangle"
          slotClass="htlad-wnyc_homepage_rectangle"
          fineprint="WNYC is funded by sponsors and member donations"
        />
      </div>
      <MediaCard
        :key="`${reactiveItems[0].id}-0`"
        showTease
        class="col-12 md:col-4 mb-3 md:hidden"
        :data="reactiveItems[0]"
        :size="{ xs: [112, 112], md: [438, 292] }"
        @on-click="dynamicNavigation(reactiveItems[0])"
      />
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems?.slice(1, props.maxItems)"
          :key="`${article.id}-${index}`"
          showTease
          class="col-12 md:col-4 mb-3"
          :data="article"
          :size="{ xs: [112, 112], md: [438, 292] }"
          @on-click="dynamicNavigation(article)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in props.maxItems - 1"
        :key="`skeleton-1-${index}`"
        class="col-12 md:col-4 mb-3"
        :size="{ xs: [112, 112], md: [438, 292] }"
      />
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
