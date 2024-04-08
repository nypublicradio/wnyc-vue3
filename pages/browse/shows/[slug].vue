<script setup>
import { useIntersectionObserver } from "@vueuse/core"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import StarIcon from "~/components/icons/StarIcon.vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import {
  checkIsFavorited,
  togglePlayEpisode,
  shareAPI,
  trackClickEvent,
  goToEpisodePage,
  hasAudio,
  addToFavorites,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"
import { useCurrentUser, useIsEpisodePlaying, useGlobalToast } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const { data: show, pending, error, refresh } = useFetch(
  `${config.public.BFF_URL}/api/show/${route.params.slug}`
)

const page = ref(show?.value?.episodes?.meta.pagination.page ?? null)
const episodes = ref(show?.value?.episodes?.data ?? null)
let maxPages = show?.value?.episodes?.meta.pagination.pages ?? null
const showImage = ref(show?.value?.show?.image?.template ?? null)
const showTitle = ref(show?.value?.show?.title ?? null)
const showTease = ref(show?.value?.show?.description ?? null)

const pendingMore = ref(false)
const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)

const { stop } = useIntersectionObserver(loadMoreRef, ([{ isIntersecting }]) => {
  // so it does not trigger on initial load and before we have data
  if (!isInitialObserver.value && episodes.value) {
    loadMoreRefVisible.value = isIntersecting
  } else {
    isInitialObserver.value = false
  }
})

// clean up the useIntersectionObserver
onUnmounted(() => {
  stop()
})

// load more episodes and track it
const loadMore = async () => {
  page.value += 1
  //console.log("page.value", page.value)
  pendingMore.value = true
  try {
    const moreShows = await $fetch(
      `${config.public.BFF_URL}/api/show/${route.params.slug}?page=${page.value}`
    )
    pendingMore.value = false
    episodes.value = [...episodes.value, ...moreShows?.episodes?.data]
    trackClickEvent(
      "Event Tracking - load more episodes",
      "Shows Page",
      show.value.show.title
    )
  } catch (e) {
    const globalToast = useGlobalToast()
    globalToast.value = {
      severity: "error",
      summary:
        "Sorry. We are having trouble loading more episodes. Please try again later.",
      life: null,
      closable: true,
    }
    console.error("error = ", e)
  }
}

const user = useCurrentUser()
const isEpisodePlaying = useIsEpisodePlaying()

// navigate back to home and track it
const routeBack = () => {
  trackClickEvent("story", "story page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
}

// finds first episode with audio to play
const firstEpisodeWithAudio = () => {
  return episodes.value.find((ep) => {
    if (hasAudio(ep.audio)) {
      return ep
    } else if (typeof ep.audio === "string") {
      return ep
    } else {
      return null
    }
  })
}
// handle the toggle play button at the top to play the most recent episode with audio and tracking
const togglePlayMostRecentEpisode = () => {
  const ep = firstEpisodeWithAudio()
  togglePlayEpisode(ep)
}

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites(show.value.show, isFavorited.value)
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}

const handleShare = () => {
  shareAPI(show.value.show, "shows slug")
}

const hasEpisodes = computed(() => {
  return episodes.value?.some((ep) => ep?.type !== "segment")
})

const hasSegments = computed(() => {
  return episodes.value?.some((ep) => ep?.type === "segment")
})

watch(show, () => {
  page.value = show?.value?.episodes?.meta.pagination.page
  maxPages = show.value.episodes?.meta.pagination.pages
  episodes.value = show.value.episodes?.data
  showImage.value = show.value.show?.image?.template ?? getEpisodeFallBackImage()
  showTitle.value = show.value.show?.title
  showTease.value = show.value.show?.description
})

watch(loadMoreRefVisible, (val) => {
  if (val) {
    loadMore()
  }
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Browse Shows",
    page_type: "browse_shows_page",
    content_group: "app_tab",
  })
})
</script>

<template>
  <section class="shows-page pb-7">
    <Html lang="en">
      <Head>
        <Title
          >Browse Shows | WNYC | New York Public Radio, Podcasts, Live Streaming Radio,
          News</Title
        >
        <Meta
          name="og:title"
          content="Browse Shows | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="Browse Shows | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
      </Head>
    </Html>
    <div class="flex align-items-center">
      <Button
        class="back-btn text-color -ml-4"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="routeBack"
        label="Back"
      />
    </div>
    <FetchError v-if="error || show === undefined" @on-click="refresh" />
    <VImage
      v-if="showImage"
      :src="showImage"
      :alt="`${showTitle} show image`"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
      :srcset="[2]"
      style="min-height: 144px"
    />
    <Skeleton
      v-else
      class="flex-none show-image max-w-9rem m-auto"
      height="144px"
      width="144px"
      borderRadius="0px"
    />
    <div
      v-if="!pending"
      class="flex justify-content-center align-items-center gap-2 mt-2 mb-4"
    >
      <Button rounded text plain @click="handleAddToFavorites">
        <template #icon> <StarIcon :active="isFavorited" class="w-2rem" /></template>
      </Button>

      <Button
        class="play-btn flex-none"
        severity="secondary"
        rounded
        @click="togglePlayMostRecentEpisode"
      >
        <template #icon>
          <PauseIcon v-if="isEpisodePlaying" />
          <PlayIcon v-else />
        </template>
      </Button>

      <Button text plain rounded @click="handleShare">
        <template #icon> <ShareIcon /></template>
      </Button>
    </div>
    <div v-else class="flex justify-content-center align-items-center gap-2 mt-2 mb-4">
      <Skeleton height="37px" width="37px" borderRadius="20px" />
      <Skeleton height="48px" width="48px" borderRadius="24px" />
      <Skeleton height="37px" width="37px" borderRadius="20px" />
    </div>
    <div v-if="!pending">
      <h2 class="text-lg mt-2">{{ showTitle }}</h2>
      <HtmlConvert :htmlContent="showTease" class="text-sm mt-2" />
    </div>
    <div v-else>
      <Skeleton
        height="16px"
        width="45%"
        borderRadius="16px"
        style="margin-bottom: 9px"
      />
      <Skeleton
        height="12px"
        width="95%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
      <Skeleton
        height="12px"
        width="90%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
      <Skeleton
        height="12px"
        width="75%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
    </div>
    <!-- <h2 class="mt-4 mb-3">Episodes</h2> -->
    <!-- <pre class="text-xs overflow-hidden">{{ episodes }}</pre> -->

    <!-- tabs for the future segment split -->
    <div class="tabs mt-5">
      <TabView :lazy="true">
        <TabPanel header="Episodes" v-if="hasEpisodes">
          <div v-if="!pending" class="flex flex-column gap-5 mt-2">
            <template v-for="ep in episodes" :key="ep.id">
              <EpisodeItem
                v-if="ep?.type !== 'segment'"
                :data="ep"
                @onClick="goToEpisodePage(ep)"
                :fallback-image="getEpisodeFallBackImage()"
              />
            </template>
          </div>
        </TabPanel>
        <TabPanel header="Segments" v-if="hasSegments">
          <div v-if="!pending" class="flex flex-column gap-5 mt-2">
            <template v-for="ep in episodes" :key="ep.id">
              <EpisodeItem
                v-if="ep?.type === 'segment'"
                :data="ep"
                @onClick="goToEpisodePage(ep)"
                :fallback-image="getEpisodeFallBackImage()"
              />
            </template>
          </div>
        </TabPanel>
      </TabView>
    </div>
    <div v-if="pending">
      <Skeleton height="18px" width="80px" borderRadius="4px" class="mb-5" />
      <skeleton-episode-item v-for="i in 10" :key="`sk1-${i}`" class="mb-5" />
    </div>
    <WnycLoader
      v-if="page < maxPages"
      ref="loadMoreRef"
      spinner
      size="40px"
      class="mt-8 flex justify-content-center"
    />
    <!-- <BackToTopButton /> -->
  </section>
</template>

<style lang="scss">
.shows-page {
  .play-btn {
    width: 50px !important;
    height: 50px !important;
    svg {
      width: 1.25rem;
      height: 1.25rem;
      margin-left: 2px;
    }
  }
}
</style>
