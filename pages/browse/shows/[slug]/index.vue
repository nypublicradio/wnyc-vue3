<script setup>
import { useIntersectionObserver } from "@vueuse/core"

import { checkIsFavorited, trackClickEvent, goToEpisodePage } from "~/utilities/helpers"
import { useGlobalToast, useIsApp } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const { data: show, status, error } = useFetch(
  `${config.public.BFF_URL}/api/v2/show/${route.params.slug}`
)

const page = ref(null)
const episodes = ref(null)
let maxPages = null

const showSlug = computed(() => show.value?.show?.slug)
const isApp = useIsApp()

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

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// navigate to the episodes page
const handleViewAll = () => {
  if (showSlug.value) {
    navigateTo(`${showSlug.value}/episodes`)
  }
}

// Watch for show data changes to update episodes and pagination
watch(
  show,
  (newShow) => {
    if (newShow) {
      page.value = newShow.episodes?.meta?.pagination.page
      maxPages = newShow.episodes?.meta?.pagination.pages
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
    page_title: "Browse Shows",
    page_type: "browse_shows_page",
    content_group: "app_tab",
  })
})
</script>

<template>
  <div class="shows-page pb-7">
    <section>
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
      <div class="flex lg:hidden align-items-center">
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
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col">
          <ShowHeader :show="show" />
        </div>
        <div class="col-fixed hidden lg:block w-20rem"></div>
      </div>
    </section>
    <div class="flex flex-wrap justify-content-center align-items-center gap-3 my-5 px-3">
      <template v-if="status === 'success'">
        <Button
          v-for="i in 5"
          :key="i"
          label="Jump Link"
          severity="secondary"
          class="px-3 md:px-4 lg:px-6"
        />
      </template>
      <template v-else>
        <Skeleton
          v-for="i in 5"
          :key="`jump-link-${i}`"
          height="2rem"
          width="8rem"
          borderRadius="1.75rem"
          class="w-7rem md:w-8rem lg:w-11rem"
        />
      </template>
    </div>
    <section class="py-4">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col">
          <div v-if="status === 'success'" class="flex flex-column gap-5">
            <div class="flex justify-content-between align-items-center">
              <h2 class="md:text-xl">Most Recent</h2>
              <Button variant="link" class="underline" @click="handleViewAll"
                >View All</Button
              >
            </div>
            <template v-for="ep in episodes" :key="ep.id">
              <!-- if the duration comes back as 0, the estimateMp3Duration function was unable to get the duration due to the url being broken, so we just hide the episodes  -->
              <MediaCard
                v-if="
                  ep?.type !== 'segment' && ep.estimatedDuration !== 0 && ep?.hasAudio
                "
                :data="ep"
                showPlayButton
                is-horizontal
                imgCol="w-7rem md:w-10rem"
                :size="{ xs: [112, 112], md: [160, 160] }"
                showTease
                :showBg="false"
                :showBgMobile="false"
                @onClick="goToEpisodePage(ep, { src: ep.cmsSource, type: ep.type })"
              />
            </template>
          </div>
          <div v-if="status !== 'success'">
            <div class="flex justify-content-between align-items-center mb-5">
              <Skeleton height="18px" width="80px" borderRadius="4px" />
              <Skeleton height="18px" width="80px" borderRadius="4px" />
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
          <WnycLoader
            v-if="page < maxPages && isApp"
            ref="loadMoreRef"
            spinner
            size="40px"
            class="mt-8 flex justify-content-center"
          />
          <Button
            v-if="!isApp"
            label="View All"
            severity="secondary"
            class="block mx-auto mt-6 px-5"
            @click="handleViewAll"
          />
          <!-- <BackToTopButton /> -->
        </div>
        <div class="col-fixed hidden lg:block w-20rem">
          <ShowSummary :show="show" />
        </div>
      </div>
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
