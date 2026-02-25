<script setup>
import { useIntersectionObserver } from "@vueuse/core"
import {
  checkIsFavorited,
  trackClickEvent,
  dynamicNavigation,
} from "~/utilities/helpers"
import { useGlobalToast, useIsApp } from "~/composables/states"

const config = useRuntimeConfig()
const route = useRoute()

const {
  data: show,
  status,
  error,
} = useFetch(`${config.public.BFF_URL}/api/v3/show/${route.params.slug}`)
// const {
//   data: show,
//   status,
//   error,
// } = useFetch(`${config.public.BFF_URL}/api/pages/wagtail/${route.params.slug}`)

const page = ref(null)
const episodes = ref([])
let maxPages = null

const showSlug = computed(() => show.value?.show?.slug)
const isApp = useIsApp()

const pendingMore = ref(false)
const loadMoreRefVisible = ref(false)
const loadMoreRef = ref(null)
const isInitialObserver = ref(true)

const mostRecentRef = ref(null)
const featuredRef = ref(null)
const seriesRef = ref(null)
const newsletterRef = ref(null)
const aboutRef = ref(null)
const supportRef = ref(null)
const sectionAnchorData = ref([
  { ref: mostRecentRef, label: "Most Recent" },
  { ref: featuredRef, label: "Featured" },
  { ref: seriesRef, label: "Series" },
  { ref: newsletterRef, label: "Newsletter" },
  { ref: aboutRef, label: "About" },
  { ref: supportRef, label: "Support Our Show" },
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

// load more episodes and track it
const loadMore = async () => {
  page.value += 1
  pendingMore.value = true
  try {
    const moreShows = await $fetch(
      `${config.public.BFF_URL}/api/v3/show/${route.params.slug}?page=${page.value}`
    )
    pendingMore.value = false
    const newEpisodes = (moreShows?.episodes?.data || []).filter(
      (ep) => ep != null
    )
    episodes.value = [...episodes.value, ...newEpisodes]
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

// scrolls to the selected section from the jump link buttons
const scrollToSection = (sectionRef, behavior = "smooth", offset = 90) => {
  const element =
    sectionRef instanceof HTMLElement ? sectionRef : sectionRef?.$el

  if (element) {
    const elementPosition =
      element.getBoundingClientRect().top + window.pageYOffset
    const offsetPosition = elementPosition - offset

    window.scrollTo({
      top: offsetPosition,
      behavior,
    })
  }
}

const breadcrumbs = computed(() => [
  { label: "Home", route: "/home" },
  { label: "Browse", route: "/browse" },
  { label: show.value?.show?.title },
])

// Watch for show data changes to update episodes and pagination
watch(
  show,
  (newShow) => {
    if (newShow?.episodes) {
      page.value = newShow.episodes?.meta?.pagination?.page || 1
      maxPages = newShow.episodes?.meta?.pagination?.pages || 0
      // Filter out any null/undefined episodes
      episodes.value = (newShow.episodes?.data || []).filter((ep) => ep != null)
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

// clean up the useIntersectionObserver
onUnmounted(() => {
  stop()
})
</script>

<template>
  <div class="shows-page pb-7" :class="{ 'is-app': isApp }">
    <Html lang="en">
      <Head>
        <Title
          >{{ show?.show?.title }} | WNYC | New York Public Radio, Podcasts,
          Live Streaming Radio, News</Title
        >
        <Meta
          name="og:title"
          :content="`${show?.show?.title} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
        <Meta
          name="twitter:title"
          :content="`${show?.show?.title} | WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News`"
        />
      </Head>
    </Html>
    <section>
      <div class="flex align-items-center">
        <Breadcrumbs :items="breadcrumbs" />
      </div>
      <FetchError v-if="error" />
    </section>
    <!-- <pre>{{ show }}</pre> -->
    <ShowHeader :show="show" />

    <!-- JUMP LINKS -->
    <div
      class="hidden md:flex flex-wrap justify-content-center align-items-center gap-3 my-5 px-3"
    >
      <template v-if="status === 'success'">
        <Button
          v-for="i in sectionAnchorData"
          :key="i.ref"
          :label="i.label"
          severity="secondary"
          class="px-3 md:px-4 lg:px-6"
          @click="scrollToSection(i.ref)"
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
        <div class="col pr-2 lg:pr-4">
          <div v-if="status === 'success'" class="flex flex-column gap-5">
            <div
              ref="mostRecentRef"
              class="flex justify-content-between align-items-center"
            >
              <h2 class="md:text-xl">Most Recent</h2>
              <Button
                severity="secondary"
                variant="link"
                class="link text-sm md:text-lg"
                @click="handleViewAll"
                label="View All"
              ></Button>
            </div>
            <template v-for="(ep, index) in episodes" :key="ep?.id">
              <!-- if the duration comes back as 0, the estimateMp3Duration function was unable to get the duration due to the url being broken, so we just hide the episodes  -->
              <MediaCard
                v-if="ep && ep.estimatedDuration !== 0 && ep?.hasAudio"
                :data="ep"
                is-horizontal
                imgCol="w-7rem md:w-10rem"
                :size="{ xs: [112, 112], md: [160, 160] }"
                showTease
                :showBg="false"
                :showBgMobile="false"
                :hasSegments="ep.hasSegments"
                @on-click="dynamicNavigation(ep)"
              />
            </template>
          </div>
          <div v-if="status !== 'success'">
            <div
              class="flex justify-content-between align-items-center mb-5 mt-2"
            >
              <Skeleton height="18px" width="80px" borderRadius="4px" />
              <Skeleton height="18px" width="80px" borderRadius="4px" />
            </div>
            <skeleton-media-card
              v-for="i in 10"
              :key="`sk1-${i}`"
              is-horizontal
              imgCol="w-7rem md:w-10rem"
              :size="[1, 1]"
              :showBg="false"
              :showBgMobile="false"
              showTease
              class="mb-6 mt-5"
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

          <div v-if="!isApp">
            <div ref="featuredRef" class="flex flex-column gap-3 mt-8">
              <h2 class="md:text-xl">Featured</h2>
            </div>
            <div ref="seriesRef" class="flex flex-column gap-3 mt-8">
              <h2 class="md:text-xl">Series</h2>
            </div>
            <div ref="newsletterRef" class="flex flex-column gap-3 mt-8">
              <h2 class="md:text-xl">Newsletter</h2>
            </div>
            <div ref="aboutRef" class="flex flex-column gap-3 mt-8">
              <h2 class="md:text-xl">About</h2>
              <HtmlConvert
                v-for="about in show?.show?.aboutModule"
                :key="about?.id"
                :htmlContent="about?.value"
              />
            </div>
            <div ref="supportRef" class="flex flex-column gap-3 mt-8">
              <h2 class="md:text-xl">Support Our Show</h2>
            </div>
            <!-- <pre class="text-xs"> {{ show }}</pre> -->
          </div>
        </div>
        <div class="col-fixed hidden lg:block w-20rem">
          <ShowSummary :show="show" />
        </div>
      </div>
    </section>
    <BackToTopButton />
  </div>
</template>

