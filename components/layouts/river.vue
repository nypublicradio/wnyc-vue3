<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 mb-3",
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-river">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div class="grid grid-nogutter">
      <div class="md:col-12 lg:col-7 grid">
        <template v-if="reactiveItems?.length > 0">
          <MediaCard
            v-for="(article, index) in reactiveItems"
            :key="`${article.id}-${index}`"
            showTease
            isHorizontal
            imgCol="w-7rem md:w-11rem"
            :class="props.cardClass"
            :data="article"
            :size="{ xs: [112, 112], md: [176, 176] }"
            @on-click="dynamicNavigation(article)"
          />
        </template>
        <skeleton-media-card
          v-else
          v-for="index in 4"
          :key="`skeleton-1-${index}`"
          :class="props.cardClass"
          :size="{ xs: [112, 112], md: [176, 176] }"
        />
      </div>
      <div class="hidden xl:flex col-1"></div>
      <div class="col-12 lg:col-5 xl:col-4 flex-none">
        <div class="w-full p-4 text-center">
          <h2>Newsletter component here</h2>
        </div>
        <div class="ad col-12 lg:col align-items-center justify-content-center">
          <story-htlAd
            layout="rectangle"
            slotClass="htlad-wnyc_homepage_rectangle"
            fineprint="WNYC is funded by sponsors and member donations"
          />
        </div>
      </div>
    </div>
  </div>
</template>
