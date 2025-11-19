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
  <div class="layout layout-left-feature">
    <h2 class="mb-4">{{ props.list.title }}</h2>

    <div class="grid">
      <MediaCard
        v-if="reactiveItems.length > 0"
        class="col-12 lg:col-6 mb-5"
        :data="reactiveItems?.[0]"
        is-vertical
        is-feature
        showTease
        :size="{
          xs: [317, 211],
          sm: [518, 345],
          md: [622, 441],
          lg: [885, 590],
          xl: [664, 443],
        }"
        @on-click="dynamicNavigation(reactiveItems[0])"
      />
      <skeleton-media-card
        v-else
        class="col-12 lg:col-6 mb-5"
        is-vertical
        is-feature
        :size="{
          xs: [317, 211],
          sm: [518, 345],
          md: [622, 441],
          lg: [885, 590],
          xl: [664, 443],
        }"
      />

      <div class="col-12 lg:col-6 grid grid-nogutter">
        <template v-if="reactiveItems.length > 0">
          <MediaCard
            v-for="(article, index) in reactiveItems.slice(1, props.maxItems)"
            :key="`${article.id}-${index}`"
            class="col-12 mb-5"
            :data="article"
            is-horizontal
            is-event
            imgCol="md:w-7rem lg:w-6"
            :size="{ xs: [112, 112], lg: [217, 159], xl: [332, 184] }"
            @on-click="dynamicNavigation(article)"
          />
        </template>
        <skeleton-media-card
          v-else
          v-for="index in 5"
          :key="`skeleton-2-${index}`"
          class="col-12 mb-5"
          is-horizontal
          is-event
          imgCol="w-6"
          :size="{ xs: [112, 112], lg: [217, 159], xl: [332, 184] }"
        />
      </div>
    </div>
  </div>
</template>
