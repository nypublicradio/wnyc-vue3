<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 md:col-6",
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-text-only">
    <h2 class="mb-4 header">{{ props.list.title }}</h2>
    <div class="grid grid-lggutter">
      <template v-if="reactiveItems?.length > 0">
        <Button
          variant="link"
          v-for="(article, index) in reactiveItems"
          :key="`${article.id}-${index}`"
          @click="dynamicNavigation(article)"
          :class="props.cardClass"
          :label="article.title"
        />
      </template>

      <div
        v-else
        v-for="index in 6"
        :key="`skeleton-text-${index}`"
        :class="props.cardClass"
      >
        <div class="flex flex-column gap-1">
          <Skeleton height="13px" borderRadius="16px" />
          <Skeleton height="13px" width="33%" borderRadius="16px" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.layout-text-only {
  .p-button {
    justify-content: flex-start;
    .p-button-label {
      @include cardTitle();
      text-align: left;
    }
  }
}
</style>
