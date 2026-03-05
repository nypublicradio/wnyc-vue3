<script setup>
import { dynamicNavigation } from "~/utilities/helpers"
const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  list: {
    type: Object,
    required: true,
  },
  cardClass: {
    type: String,
    default: "col-12 md:col-6",
  },
  seeMore: {
    type: Object,
    default: null,
  },
})

const reactiveItems = toRef(props.list, "listItems")
</script>

<template>
  <div class="layout layout-text-only">
    <LayoutsTitleHeader
      :label="props.label || props.list.title"
      :seeMore="props.seeMore"
    />
    <div class="w-full lg:w-10 xl:w-9">
      <div class="grid grid-lggutter">
        <template v-if="reactiveItems?.length > 0">
          <div
            v-for="(article, index) in reactiveItems"
            :key="`${article.id}-${index}`"
            :class="props.cardClass"
            class="py-0 my-0"
          >
            <div
              class="h-full py-2 md:py-3"
              style="border-radius: 0"
              :style="{
                'border-bottom':
                  index === reactiveItems.length - 1
                    ? 'none'
                    : '1px solid var(--p-surface-25)',
              }"
            >
              <Button
                variant="link"
                @click="dynamicNavigation(article)"
                :label="article.title"
                class="px-0 border-noround"
              />
            </div>
            <!-- <divider /> -->
          </div>
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
