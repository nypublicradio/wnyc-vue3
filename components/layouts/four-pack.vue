<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 md:col-6 lg:col-3 mb-3",
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
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-four-pack">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div class="grid hidden lg:flex">
      <template v-if="reactiveItems?.length > 0">
        <MediaCard
          v-for="(item, index) in reactiveItems.slice(0, props.maxItems)"
          :key="`${item.id}-${index}`"
          showTease
          :class="props.cardClass"
          :data="item"
          :size="{
            xs: [112, 112],
            md: [423, 290],
            lg: [261, 174],
            xl: [324, 216],
          }"
          @on-click="dynamicNavigation(item)"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in 4"
        :key="`skeleton-1-${index}`"
        :class="props.cardClass"
        :size="{
          xs: [112, 112],
          md: [423, 290],
          lg: [261, 174],
          xl: [324, 216],
        }"
      />
    </div>

    <HorizontalScrollFeature
      :data="reactiveItems"
      itemSize="248px"
      class="block lg:hidden"
    >
      <template #default>
        <MediaCard
          v-for="(item, index) in reactiveItems.slice(
            0,
            props.scrollingMaxItems ?? props.maxItems
          )"
          :data="item"
          :key="`horzScroll-${index}-}${item.label}`"
          is-vertical
          :size="{ xs: [248, 166] }"
          :showBg="true"
          :showBgMobile="true"
          :hideDate="true"
          :showTease="true"
          class="item btn"
          @on-click="dynamicNavigation(item)"
        />
      </template>
      <template #skeleton>
        <div class="flex w-full">
          <skeleton-media-card
            v-for="i in 5"
            :key="`${i}-skeleton`"
            is-vertical
            :size="[3, 2]"
            :showBg="true"
            :showBgMobile="true"
            :hideDate="true"
            :showTease="true"
            class="item btn"
          />
        </div>
      </template>
    </HorizontalScrollFeature>
  </div>
</template>
