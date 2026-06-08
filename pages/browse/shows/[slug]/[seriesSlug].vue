<script setup>
import { FALLBACKIMAGE } from "~/composables/globals"
import { trackClickEvent } from "~/utilities/helpers"

const config = useRuntimeConfig()
const route = useRoute()

const endpoint = computed(
  () =>
    `${config.public.BFF_URL}/api/v3/show/${route.params.slug}/series/${route.params.seriesSlug}`
)

const {
  data: seriesResponse,
  status,
  error,
} = await useFetchWrapper(endpoint, {
  key: `show-series-${route.params.slug}-${route.params.seriesSlug}`,
})

const series = computed(() => seriesResponse.value?.series)
const show = computed(() => seriesResponse.value?.show)
const body = computed(() => seriesResponse.value?.body ?? [])
const hasError = computed(() => Boolean(error.value))

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  {
    label: show.value?.title,
    route: `/browse/shows/${route.params.slug}`,
  },
  { label: series.value?.title },
])

const trackSeriesLoadMore = () => {
  trackClickEvent(
    "Event Tracking - load more series curated list",
    "Series Page",
    series.value?.title
  )
}

onMounted(() => {
  if (!series.value) return

  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: series.value.title,
    page_type: "series_page",
    content_group: "app_tab",
    show_title: show.value?.title,
  })
})

const headTitle = computed(() => {
  const title = series.value?.seoTitle || series.value?.title
  return title ? `${title} | WNYC` : "WNYC"
})
const description = computed(() => series.value?.searchDescription)
const ogTitle = computed(() => series.value?.socialTitle || headTitle.value)
const ogDescription = computed(() => series.value?.socialDescription || description.value)
const ogImage = computed(() => series.value?.thumbnail || FALLBACKIMAGE)

useHead(() => ({
  title: headTitle.value,
  meta: series.value?.preventSearchIndexing
    ? [{ name: "robots", content: "noindex" }]
    : [],
}))

useSeoMeta({
  title: () => headTitle.value,
  ogTitle: () => ogTitle.value,
  description: () => description.value,
  ogDescription: () => ogDescription.value,
  ogImage: () => ogImage.value,
})
</script>

<template>
  <div class="series-page pb-7">
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
      <FetchError v-if="hasError" />
    </section>

    <template v-if="!hasError">
      <section class="py-4 md:py-5">
        <div class="grid">
          <div class="col-fixed hidden xxl:block w-20rem"></div>
          <div class="col min-w-0 pr-2 lg:pr-4">
            <div v-if="status === 'success'" class="series-page__content">
              <h1 class="series-page__title mb-5 md:mb-6">
                {{ series?.title }}
              </h1>

              <VStreamfield
                :streamfieldBlocks="body"
                curated-list-layout-override="river"
                curated-list-card-class="col-12"
                enable-curated-list-load-more
                :curated-list-initial-limit="15"
                :curated-list-limit-increment="15"
                curated-list-load-more-label="Load More"
                @curated-list-load-more="trackSeriesLoadMore"
              />
            </div>

            <div v-else class="flex flex-column gap-5">
              <Skeleton height="3rem" width="70%" borderRadius="0" class="mb-2" />
              <skeleton-media-card
                v-for="i in 15"
                :key="`series-skeleton-${i}`"
                is-horizontal
                imgCol="w-7rem md:w-12rem"
                :size="{ xs: [112, 112], md: [192, 192] }"
                :showBg="false"
                :showBgMobile="false"
                showTease
              />
            </div>

            <div class="block lg:hidden mt-8">
              <ShowSummary :show="show" />
            </div>
          </div>
          <div class="col-fixed hidden lg:block w-20rem">
            <ShowSummary :show="show" />
          </div>
        </div>
      </section>
      <BackToTopButton />
    </template>
  </div>
</template>

<style lang="scss" scoped>
.series-page {
  .series-page__content {
    max-width: 52rem;
  }

  .series-page__title {
    font-size: 3.25rem;
    line-height: 1;
    font-weight: 800;
  }

  @include media("<md") {
    .series-page__title {
      font-size: 2.25rem;
    }
  }
}
</style>
