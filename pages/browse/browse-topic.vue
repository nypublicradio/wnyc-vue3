<script setup>
import { goToShowPage } from "~/utilities/helpers"
import { useBreakpoints } from "~/composables/useBreakpoints"

const route = useRoute()
const config = useRuntimeConfig()
const { breakpoint } = useBreakpoints()
const isMobile = computed(() => breakpoint("<md"))
const {
  data: categoryData,
  status,
  error,
} = useFetchWrapper(
  `${config.public.BFF_URL}/api/browse/browse-topic/getTopicData`,
  {
    key: "browse-topics",
    params: {
      topic: route.query.topic,
    },
  }
)
// navigate back to home and track it
const backHome = () => {
  navigateTo("/browse")
}

const label = route.query.label

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: `Browse Topics - ${route.query.topic}`,
    page_type: "browse_topics_tab",
    content_group: "app_tab",
  })
})

onUnmounted(() => {
  categoryData.value = null
})

useHead({
  title:
    "Browse Topics | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
  meta: [
    {
      name: "og:title",
      content:
        "Browse Topics | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
    {
      name: "twitter:title",
      content:
        "Browse Topics | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News",
    },
  ],
})
</script>
<template>
  <div class="browse-topic-page">
    <section class="">
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="backHome"
        />
        <h1>{{ label }}</h1>
      </div>
    </section>
    <FetchError v-if="error" />
    <section class="grid">
      <template v-if="status === 'success'">
        <ShowItem
          v-for="show in categoryData"
          :data="show"
          :key="show.title"
          class="col-12 md:col-4 md:mb-5"
          rootClass="md:align-items-start"
          contentClass="md:flex-column gap-3 md:gap-2"
          imageClass="w-6rem xs:w-7rem md:w-13rem"
          :size="{ xxs: [96, 96], xs: [112, 112], md: [208, 208] }"
          :hideButtons="!isMobile"
          @onClick="goToShowPage(show)"
        />
      </template>

      <skeleton-show-item
        v-else
        v-for="(show, index) in 15"
        :key="`sk1-${index}`"
        class="col-12 md:col-4 md:mb-5"
        contentClass="md:flex-column gap-3 md:gap-2"
        imageClass="w-7rem md:w-13rem h-7rem md:h-13rem"
        :hideButtons="!isMobile"
      />
    </section>
  </div>
</template>

<style lang="scss">
.browse-topic-page {
  max-width: $thinContentWidth;
  margin: auto;
}
</style>
