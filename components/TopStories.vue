<script setup>
const props = defineProps({
  articles: {
    type: Array,
    default: () => [],
  },
})

const reactiveArticles = toRef(props, "articles")
</script>

<template>
  <div class="top-stories grid">
    <MediaCard
      v-if="reactiveArticles.length > 0"
      class="col-12 lg:col-8 mb-3"
      :data="reactiveArticles[0]"
      is-horizontal
      is-feature
      imgCol="w-8"
    />
    <skeleton-media-card
      v-else
      class="col-12 lg:col-8 mb-3"
      is-horizontal
      is-feature
      imgCol="w-8"
    />

    <div class="col mb-3 hidden lg:flex">AD HERE</div>
    <template v-if="reactiveArticles.length > 0">
      <MediaCard
        v-for="(article, index) in reactiveArticles?.slice(1)"
        :key="`${article.id}-${index}`"
        class="col-12 md:col-4 mb-3"
        :data="article"
      />
    </template>
    <skeleton-media-card
      v-else
      v-for="index in 6"
      :key="`skeleton-1-${index}`"
      class="col-12 md:col-4 mb-3"
    />

    <MediaCard
      v-if="reactiveArticles.length > 0"
      class="col-12 lg:col-6 mb-3"
      :data="reactiveArticles?.[0]"
      is-vertical
      is-feature
      :img-width="672"
      :img-height="444"
    />
    <skeleton-media-card
      v-else
      class="col-12 lg:col-6 mb-3"
      is-vertical
      is-feature
      :img-width="672"
      :img-height="444"
    />

    <div class="col-12 lg:col-6 grid grid-nogutter">
      <template v-if="reactiveArticles.length > 0">
        <MediaCard
          v-for="(article, index) in reactiveArticles.slice(1)"
          :key="`${article.id}-${index}`"
          class="col-12 mb-3"
          :data="article"
          is-horizontal
          is-event
          imgCol="w-6"
          :img-width="320"
          :img-height="150"
        />
      </template>
      <skeleton-media-card
        v-else
        v-for="index in 5"
        :key="`skeleton-2-${index}`"
        class="col-12 mb-3"
        is-horizontal
        is-event
        imgCol="w-6"
        :img-width="320"
        :img-height="150"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);
.top-stories {
}
</style>
