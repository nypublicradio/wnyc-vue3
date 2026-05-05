<script setup>

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
    default: "river-col",
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
</script>

<template>
  <div class="layout layout-river">
    <LayoutsTitleHeader
      :label="props.label || props.list.title"
      :seeMore="props.seeMore"
    />
    <div v-if="reactiveItems?.length > 0" class="river-grid">
      <div
        v-for="(article, index) in reactiveItems"
        :key="`${article.id}-${index}`"
        :class="props.cardClass"
      >
        <MediaCard
          showTease
          isHorizontal
          imgCol="river-img-col"
          :data="article"
          :size="{ xs: [192, 192] }"
          :loading="props.loading"
        />
      </div>
    </div>
    <div v-else class="river-grid">
      <div v-for="index in 4" :key="`skeleton-river-${index}`" :class="props.cardClass">
        <skeleton-media-card isHorizontal imgCol="river-img-col" class="w-full" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@import "~/assets/scss/breakpoints.scss";

.layout-river {
  container-type: inline-size;
  // container-name: river;
}

.river-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -1rem;
  margin-left: -1rem;
  margin-top: -1rem;
}

.river-col {
  box-sizing: border-box;
  flex: 0 0 auto;
  padding: 1rem;
  width: 100%;

  @container (min-width: #{$lg}) {
    width: 50%;
  }
}

:deep(.river-img-col) {
  width: 7rem !important;

  @container (min-width: #{$md}) {
    width: 12rem !important;
  }
}

:deep(.media-card.show-bg) {
  .holder {
    background-color: transparent !important;
    border-radius: 0 !important;

    > .content {
      padding: 0 0 0 1rem !important;
    }
  }

  @container (min-width: #{$md}) {
    .holder {
      background-color: var(--p-content-background) !important;
      border-radius: var(--media-card-border-radius) !important;

      > .content {
        padding: 1.25rem 1rem !important;
      }
    }
  }
}

:deep(.media-card.show-bg-mobile) {
  @container (max-width: 767px) {
    .holder {
      background-color: var(--p-content-background) !important;
      border-radius: var(--media-card-border-radius) !important;

      > .content {
        padding: 1.25rem 1rem !important;
      }
    }
  }
}
</style>
