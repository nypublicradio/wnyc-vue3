<script setup>
import { useIntersectionObserver } from "@vueuse/core"
import {
  checkIsFavorited,
  trackClickEvent,
  dynamicNavigation,
} from "~/utilities/helpers"
import { useGlobalToast } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()
const podcastId = ref(null)

const meta = ref(null)
const page = ref(1)
const episodes = ref(null)

const pendingMore = ref(false)
const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)

const {
  data: show,
  status,
  error,
} = useFetch(
  `${config.public.BFF_URL}/api/pages/wagtail/${route.params.slug}?showOnly=true`,
  {
    onResponse(res) {
      podcastId.value = res.response._data.linkedDataSource[0].value.id
    },
  }
)

const {
  data: scShows,
  status: scStatus,
  error: scError,
} = useFetch(
  () =>
    `${config.public.BFF_URL}/api/v3/show/${podcastId.value}/episodes?offset=${
      meta.value?.pagination?.offset || 0
    }&limit=${meta.value?.pagination?.limit || 10}`,
  {
    onResponse(res) {
      pendingMore.value = false
      meta.value = res.response._data.meta
      //episodes.value = res.response._data.data

      episodes.value =
        episodes.value?.length > 0
          ? [...episodes.value, ...res.response._data.data]
          : res.response._data.data
    },
    onError(error) {
      pendingMore.value = false
      const globalToast = useGlobalToast()
      globalToast.value = {
        severity: "error",
        summary:
          "Sorry. We are having trouble loading more episodes. Please try again later.",
        life: null,
        closable: true,
      }
      console.error("error = ", error)
    },
    watch: [podcastId],
    immediate: false,
  }
)

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

const { stop } = useIntersectionObserver(
  loadMoreRef,
  ([{ isIntersecting }]) => {
    // so it does not trigger on initial load and before we have data
    if (!isInitialObserver.value && episodes.value) {
      loadMoreRefVisible.value = isIntersecting
    } else {
      isInitialObserver.value = false
    }
  }
)

// clean up the useIntersectionObserver
onUnmounted(() => {
  stop()
})
// load more episodes and track it
const loadMore = async () => {
  page.value += 1
  pendingMore.value = true
  meta.value.pagination.offset += meta.value.pagination.limit
  trackClickEvent(
    "Event Tracking - load more episodes",
    "Shows Page",
    show.value?.show?.title
  )
}

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// Watch for show data changes to update episodes and pagination
watch(
  show,
  (newShow) => {
    if (newShow?.episodes) {
      page.value = newShow.episodes?.meta?.pagination?.page || 1
      maxPages = newShow.episodes?.meta?.pagination?.pages || 0
      episodes.value = newShow.episodes?.data
    }
  },
  { immediate: true }
)

watch(loadMoreRefVisible, (val) => {
  if (val) {
    loadMore()
  }
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Browse Show Episodes",
    page_type: "browse_shows_episodes_page",
    content_group: "app_tab",
  })
})
</script>

<template>
  <div class="show-episodes-page pb-7">
    <section>
      <Html lang="en">
        <Head>
          <Title
            >Browse Shows | WNYC | New York Public Radio, Podcasts, Live
            Streaming Radio, News</Title
          >
          <Meta
            name="og:title"
            content="Browse Show Episodes | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
          />
          <Meta
            name="twitter:title"
            content="Browse Show Episodes | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
          />
        </Head>
      </Html>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
      <FetchError v-if="error || scError" />
    </section>

    <!-- <pre>{{ scShows?.meta }}</pre> -->
    <ShowHeader :show="show" />

    <section class="py-4">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
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
                imgCol="w-7rem md:w-10rem"
                :size="{ xs: [112, 112], md: [160, 160] }"
                showTease
                :showBg="false"
                :showBgMobile="false"
                @on-click="dynamicNavigation(ep)"
              />
            </template>
          </div>
          <div v-if="status === 'pending' || scStatus === 'pending'">
            <div class="flex mb-5">
              <Skeleton height="1.5rem" width="80px" borderRadius="4px" />
            </div>
            <skeleton-media-card
              v-for="i in 10"
              :key="`sk1-${i}`"
              showPlayButton
              is-horizontal
              imgCol="w-7rem md:w-10rem"
              :size="[1, 1]"
              :showBg="false"
              :showBgMobile="false"
              showTease
              class="mb-5"
            />
          </div>
          <!-- v-if="meta?.pagination?.count < meta?.totalCount" -->
          <WnycLoader
            ref="loadMoreRef"
            spinner
            size="40px"
            class="mt-8 flex justify-content-center"
          />
          <BackToTopButton />
        </div>
        <div class="col-fixed hidden lg:block w-20rem">
          <ShowSummary :show="show" />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.show-episodes-page {
  .show-header-holder {
    background-color: var(--p-surface-950);
  }
}
</style>
