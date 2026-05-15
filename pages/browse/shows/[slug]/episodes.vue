<script setup>
import { useIntersectionObserver } from "@vueuse/core"
import {
  checkIsFavorited,
  trackClickEvent,
  dynamicNavigation,
  getFirstSentence,
  stripHtmlTags,
} from "~/utilities/helpers"
import getShowImage from "~/utilities/metadataHelpers"
import { useGlobalToast } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()

const limit = 10
const episodes = ref([])
const meta = ref(null)

const pendingMore = ref(false)
const loadMoreRef = ref(null)

// Await the initial show data fetch for SSR
const {
  data: show,
  status,
  error,
} = await useFetchWrapper(
  `${config.public.BFF_URL}/api/pages/wagtail/${route.params.slug}?showOnly=true`,
  {
    key: `show-episodes-page-${route.params.slug}`,
  }
)

if (show.value?.redirect) {
  await navigateTo(show.value.location, {
    redirectCode: show.value.statusCode || 301,
    external: /^https?:\/\//.test(show.value.location),
  })
}

const podcastId = computed(
  () => show.value?.linkedDataSource?.[0]?.value?.id ?? null
)

// Await the initial episodes data fetch for SSR
const {
  data: episodeData,
  status: scStatus,
  error: scError,
} = await useFetchWrapper(
  () =>
    podcastId.value
      ? `${config.public.BFF_URL}/api/v3/show/${podcastId.value}/episodes`
      : null,
  {
    key: `episodes-${podcastId.value || route.params.slug}`,
    query: { offset: 0, limit },
  }
)

// Sync initial fetched data into our mutable refs for client-side pagination
watch(
  episodeData,
  (val) => {
    if (val) {
      episodes.value = val.data ?? []
      meta.value = val.meta ?? null
    }
  },
  { immediate: true }
)

const hasMore = computed(() => {
  if (!meta.value?.pagination) return false

  // Try to use the explicit hasMore boolean if provided by the BFF
  if (typeof meta.value.hasMore === "boolean") {
    return meta.value.hasMore
  }

  const totalCount =
    meta.value.pagination.count ??
    meta.value.totalCount ??
    meta.value.pagination.totalCount
  const nextOffset = meta.value.pagination.offset + limit

  return !totalCount || nextOffset < totalCount
})

// Pagination handling
const loadMore = async () => {
  if (!hasMore.value || pendingMore.value) return

  pendingMore.value = true

  const nextOffset = meta.value.pagination.offset + limit

  try {
    const res = await $fetch(
      `${config.public.BFF_URL}/api/v3/show/${podcastId.value}/episodes`,
      { query: { offset: nextOffset, limit } }
    )

    if (res?.data) {
      episodes.value = [...episodes.value, ...res.data]
      meta.value = res.meta
    }

    trackClickEvent(
      "Event Tracking - load more episodes",
      "Shows Page",
      show.value?.title
    )
  } catch (err) {
    const globalToast = useGlobalToast()
    globalToast.value = {
      severity: "error",
      summary:
        "Sorry. We are having trouble loading more episodes. Please try again later.",
      life: null,
      closable: true,
    }
    console.error("Pagination error:", err)
  } finally {
    pendingMore.value = false
  }
}

const { stop } = useIntersectionObserver(
  loadMoreRef,
  ([{ isIntersecting }]) => {
    if (
      isIntersecting &&
      episodes.value?.length &&
      hasMore.value &&
      !pendingMore.value
    ) {
      loadMore()
    }
  }
)

const isFavorited = ref(false)
onMounted(() => {
  watchEffect(async () => {
    isFavorited.value = await checkIsFavorited(route.params.slug)
  })
})

const hasError = computed(() => {
  const e1 = error.value
  const e2 = scError.value
  return (
    (e1 && e1.statusCode !== 404 && e1.status !== 404) ||
    (e2 && e2.statusCode !== 404 && e2.status !== 404)
  )
})

onMounted(() => {
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Browse Show Episodes",
    page_type: "browse_shows_episodes_page",
    content_group: "app_tab",
  })
})

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  {
    label: show.value?.title,
    route: `/browse/shows/${route.params.slug}`,
  },
  {
    label: "All Episodes",
  },
])

const getDescription = (aboutModule) => {
  if (aboutModule?.length) {
    return getFirstSentence(stripHtmlTags(aboutModule[0].value))
  }
}

const title = `${show.value?.title} episodes | WNYC`
const description = `Listen to the latest episodes from ${show.value?.title} on WNYC.org.`
const image = getShowImage(show)
useHead({
  title,
})
useSeoMeta({
  title,
  ogTitle: title,
  description: description,
  ogDescription: description,
})
if (image) {
  useSeoMeta({
   ogImage: image,
  })
}

onUnmounted(() => stop())
</script>

<template>
  <div class="show-episodes-page pb-7">
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
      <FetchError v-if="hasError" />
    </section>

    <ShowHeader :show="show" />

    <section class="py-4">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col min-w-0 pr-2 lg:pr-4">
          <div class="flex flex-column gap-5">
            <h2 class="md:text-xl">All Episodes</h2>
            <template v-for="ep in episodes" :key="ep.id">
              <!-- if the duration comes back as 0, the estimateMp3Duration function was unable to get the duration due to the url being broken, so we just hide the episodes  -->
              <MediaCard
                v-if="
                  ep?.type !== 'segment' &&
                  ep.estimatedDuration !== 0 &&
                  ep?.hasAudio
                "
                :data="ep"
                showPlayButton
                is-horizontal
                imgCol="w-7rem md:w-12rem"
                :size="{ xs: [112, 112], md: [192, 192] }"
                showTease
                :showBg="true"
                :showBgMobile="false"
              />
            </template>
          </div>
          <div v-if="status === 'pending' || scStatus === 'pending'">
            <skeleton-media-card
              v-for="i in 10"
              :key="`sk1-${i}`"
              showPlayButton
              is-horizontal
              imgCol="w-7rem md:w-12rem"
              :size="[1, 1]"
              :showBg="true"
              :showBgMobile="false"
              showTease
              class="my-5"
            />
          </div>
          <WnycLoader
            v-if="pendingMore"
            spinner
            size="40px"
            class="mt-8 flex justify-content-center"
          />
          <div ref="loadMoreRef" class="w-full h-1rem"></div>
        </div>
        <div class="col-fixed hidden lg:block w-20rem">
          <ShowSummary :show="show" />
        </div>
      </div>
    </section>
    <BackToTopButton />
  </div>
</template>

<style lang="scss">
.show-episodes-page {
  .show-header-holder {
    background-color: var(--p-surface-950);
  }
}
</style>
