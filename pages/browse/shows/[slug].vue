<script setup>
import { useIntersectionObserver } from "@vueuse/core"

import FollowIcon from "~/components/icons/FollowIcon.vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"

import {
  checkIsFavorited,
  togglePlayEpisode,
  //shareAPI,
  trackClickEvent,
  goToEpisodePage,
  hasAudio,
  addToFavorites2,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"
import {
  useCurrentUser,
  useIsEpisodePlaying,
  useGlobalToast,
  useIsApp,
} from "~/composables/states"
import { mediaTypeRoutes, mediaTypes } from "~/composables/globals"
import useSleepTimer from "~/composables/useSleepTimer"

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const { data: show, status, error } = useFetch(
  `${config.public.BFF_URL}/api/v2/show/${route.params.slug}`
)

const page = ref(null)
const episodes = ref(null)
let maxPages = null
const showImage = ref(null)
const showTitle = ref(null)
const showTease = ref(null)
const showScheduleSummary = ref(null)
const isApp = useIsApp()
const user = useCurrentUser()
const isEpisodePlaying = useIsEpisodePlaying()

const pendingMore = ref(false)
const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)

const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()

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
  pendingMore.value = true
  try {
    const moreShows = await $fetch(
      `${config.public.BFF_URL}/api/v2/show/${route.params.slug}?page=${page.value}`
    )
    pendingMore.value = false
    episodes.value = [...episodes.value, ...moreShows?.episodes?.data]
    trackClickEvent(
      "Event Tracking - load more episodes",
      "Shows Page",
      show.value.show.title
    )
  } catch (e) {
    pendingMore.value = false
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
  // handle NPR show segments.
  if (show.value.show.cmsSource === "npr") {
    // route to the first episode with a url parameter
    navigateTo({
      path: `${mediaTypeRoutes[mediaTypes.EPISODE]}${show.value.episodes.data[0].id}`,
      query: {
        src: "npr",
        type: "episode",
        autoplay: true,
      },
    })
  } else {
    const ep = firstEpisodeWithAudio()
    togglePlayEpisode(ep)
  }
}

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: show.value.show,
    isFavorited: isFavorited.value,
    message: "Updated your followed shows.",
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}

// const handleShare = () => {
//   //(show.value.show, "shows page")
// }

const hasEpisodes = computed(() => {
  return episodes.value?.some((ep) => ep?.type !== "segment")
})

watch(show, () => {
  page.value = show?.value?.episodes?.meta?.pagination.page
  maxPages = show.value.episodes?.meta?.pagination.pages
  episodes.value = show.value.episodes?.data
  showImage.value = show.value.show?.image?.template ?? getEpisodeFallBackImage()
  showTitle.value = show.value.show?.title
  showTease.value = show.value.show?.tease
  showScheduleSummary.value = show.value.show?.scheduleSummary
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
  <div class="shows-page pb-7">
    <section>
      <!-- <pre class="text-xs">{{ show.show }}</pre> -->
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
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="routeBack"
          label="Back"
        />
      </div>
      <FetchError v-if="error" />
    </section>
    <section class="top style-mode-dark py-3 md:py-6">
      <div class="flex justify-content-start gap-3 md:gap-5">
        <VImage
          v-if="showImage && status === 'success'"
          :src="showImage"
          :alt="`${showTitle} show image`"
          :size="{ xs: [112, 112], md: [208, 208] }"
          class="flex-none show-image max-w-7rem md:max-w-13rem"
          :srcset="[2]"
        />
        <Skeleton
          v-else
          class="flex-none show-image w-7rem md:w-13rem h-7rem md:h-13rem"
          borderRadius="0px"
        />
        <div
          v-if="status === 'success'"
          class="flex flex-column justify-content-start gap-3 mt-1 md:mt-2"
        >
          <h2 class="line-height-1 text-2xl md:text-6xl">{{ showTitle }}</h2>
          <p v-if="showScheduleSummary" class="mt-0 md:-mt-3">
            {{ showScheduleSummary }}
          </p>
          <HtmlConvert
            no-blocks
            :htmlContent="showTease"
            class="hidden md:block text-sm md:text-base"
          />
          <!-- desktop buttons -->
          <div class="hidden md:flex align-items-center gap-3">
            <Button
              class="play-btn flex-none"
              severity="secondary"
              rounded
              aria-label="play toggle"
              tabindex="0"
              :disabled="!hasEpisodes"
              @click="togglePlayMostRecentEpisode"
            >
              <template #icon>
                <PauseIcon v-if="isEpisodePlaying" />
                <PlayIcon v-else />
              </template>
            </Button>

            <Button
              rounded
              severity="secondary"
              aria-label="follow"
              label="Follow"
              @click="handleAddToFavorites"
            >
              <template #icon>
                <FollowIcon :active="isFavorited" class="w-1rem"
              /></template>
            </Button>

            <SleepTimerButton
              v-if="isApp"
              @emit-click="handleSleepTimer"
              :isActive="sleepTimerRunning"
              :isText="false"
              label="Sleep Timer"
              iconClass="w-1rem"
            />
            <Button
              v-else
              label="Listen in the app"
              severity="secondary"
              rounded
              class=""
              @click="navigateTo('/mobile')"
            >
              <template #icon>
                <DevicesIcon class="w-1rem" />
              </template>
            </Button>
          </div>
        </div>
        <div v-else class="hidden md:flex flex-column gap-3 w-full">
          <div class="flex flex-column gap-0">
            <Skeleton class="my-2" height="48px" width="75%" borderRadius="24px" />
            <Skeleton
              v-if="showScheduleSummary"
              height="14px"
              width="35%"
              borderRadius="24px"
            />
          </div>
          <div class="flex flex-column gap-2">
            <Skeleton height="14px" width="100%" borderRadius="24px" />
            <Skeleton height="14px" width="100%" borderRadius="24px" />
            <Skeleton height="14px" width="72%" borderRadius="24px" />
          </div>
          <div class="flex gap-3">
            <Skeleton height="48px" width="48px" borderRadius="24px" />
            <Skeleton height="41px" width="99px" borderRadius="24px" />
            <Skeleton height="41px" width="178px" borderRadius="24px" />
          </div>
        </div>
      </div>
      <!-- mobile buttons -->
      <div
        v-if="status === 'success'"
        class="flex md:hidden justify-content-center align-items-center gap-2 mt-3"
      >
        <Button rounded text plain aria-label="follow" @click="handleAddToFavorites">
          <template #icon>
            <FollowIcon :active="isFavorited" class="w-2rem mt-1"
          /></template>
        </Button>

        <Button
          class="play-btn flex-none"
          severity="secondary"
          rounded
          aria-label="play toggle"
          tabindex="0"
          :disabled="!hasEpisodes"
          @click="togglePlayMostRecentEpisode"
        >
          <template #icon>
            <PauseIcon v-if="isEpisodePlaying" />
            <PlayIcon v-else />
          </template>
        </Button>

        <SleepTimerButton
          v-if="isApp"
          @emit-click="handleSleepTimer"
          :isActive="sleepTimerRunning"
          :isText="true"
          class="mt-1"
        />
        <Button
          v-else
          label=""
          severity="secondary"
          rounded
          text
          plain
          class=""
          @click="navigateTo('/mobile')"
        >
          <template #icon>
            <DevicesIcon class="w-2rem mt-1" />
          </template>
        </Button>
      </div>
      <div
        v-else
        class="flex md:hidden justify-content-center align-items-center gap-2 mt-3"
      >
        <Skeleton height="37px" width="37px" borderRadius="20px" />
        <Skeleton height="48px" width="48px" borderRadius="24px" />
        <Skeleton height="37px" width="37px" borderRadius="20px" />
      </div>
    </section>
    <section class="py-4">
      <div v-if="status === 'success'" class="flex flex-column gap-5">
        <h2>Most Recent</h2>
        <template v-for="ep in episodes" :key="ep.id">
          <!-- if the duration comes back as 0, the estimateMp3Duration function was unable to get the duration due to the url being broken, so we just hide the episodes  -->
          <MediaCard
            v-if="ep?.type !== 'segment' && ep.estimatedDuration !== 0 && ep?.hasAudio"
            :data="ep"
            showPlayButton
            is-horizontal
            imgCol="w-7rem"
            :showBg="false"
            :showBgMobile="false"
            @onClick="goToEpisodePage(ep, { src: ep.cmsSource, type: ep.type })"
          />
        </template>
      </div>
      <div v-if="status === 'pending'">
        <Skeleton height="18px" width="80px" borderRadius="4px" class="mb-5" />
        <skeleton-media-card
          v-for="i in 10"
          :key="`sk1-${i}`"
          showPlayButton
          is-horizontal
          imgCol="w-7rem"
          :size="[1, 1]"
          :showBg="false"
          :showBgMobile="false"
          class="mb-5"
        />
      </div>
      <WnycLoader
        v-if="page < maxPages && isApp"
        ref="loadMoreRef"
        spinner
        size="40px"
        class="mt-8 flex justify-content-center"
      />
      <!-- <BackToTopButton /> -->
    </section>
  </div>
</template>

<style lang="scss">
.shows-page {
  .top {
    background-color: var(--p-surface-950);
  }
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
