<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-featured-topic">
    <h2 class="mb-4">{{ props.list?.title }}</h2>

    <div class="grid">
      <MediaCard
        v-if="reactiveItems?.length > 0"
        class="col-12 lg:col-8 mb-3"
        titleClasses="t7lines"
        :data="reactiveItems[0]"
        is-horizontal
        is-feature
        showTease
        imgCol="w-8"
        :size="{ xs: [369, 246], sm: [592, 280], lg: [592, 480] }"
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
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveItems?.slice(1)"
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
        v-for="index in 6"
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
