<script setup>
import { useToast } from "primevue/usetoast"
import {
  trackClickEvent,
  togglePlayEpisode,
  checkIsFavorited,
  copyToClipBoard,
} from "~/utilities/helpers"
import { useFallbackImages } from "~/composables/useFallbackImages"
import { useIsApp } from "~/composables/states"
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { getEpisodeHeadFallBackImage } = useFallbackImages()
const toast = useToast()
const isMinimized = ref(false)
const isApp = useIsApp()
definePageMeta({
  pageTransition: false,
})

const {
  data: episode,
  status,
  error,
} = useFetch(
  `${config.public.BFF_URL}/api/v2/show/episode/${route.query.src}/${route.params.slug}`,
  {
    onResponse({ response }) {
      const res = response._data
      $analytics.sendPageView({
        page_title: res.title,
        page_type: "episode_page",
        content_group: "on_demand_episode_transcript",
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res.publicationDate,
        article_updated_date: res.updatedDate
          ? res.updatedDate
          : res.publicationDate,
        article_title: res.title,
      })

      // check route param autoplay exists and if so, play the first segment
      if (route.query.autoplay === "true") {
        togglePlayEpisode(res.audio[0])
        // remove the autoplay query param
        router.replace({ query: { ...route.query, autoplay: null } })
      }
    },
    onResponseError() {
      toast.add({
        severity: "error",
        summary:
          "We are having a problem loading this episode's transcript. Please try again later.",
        life: 6000,
        closable: true,
      })
    },
  }
)
const episodeData = computed(() => episode.value)
const theSlug = computed(
  () =>
    episodeData.value?.showSlug ||
    episodeData.value?.show ||
    episodeData.value?.headers.brand.slug
)

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// handle returning / routing to the full episode page
const handleReturnToEpisode = () => {
  trackClickEvent(
    "Click Tracking - Return to Episode from transcript",
    "Episode transcript",
    `/browse/shows/episode/${route.params.slug}`
  )
  navigateTo(
    `/browse/shows/episode/${route.params.slug}?src=${route.query.src}&type=${route.query.type}`
  )
}

// handle transcript link click
const handleTranscriptLinkClick = () => {
  trackClickEvent(
    "Click Tracking - Transcript Link",
    "Episode slug",
    route.fullPath
  )
  copyToClipBoard(
    `${window.location.href}`,
    "Transcript link copied to clipboard"
  )
}

// get the image for the episode. if the episode image is the same as the show image, use the fallback image
const getEpisodeImage = () => {
  const epImage = episodeData.value?.image
  const showImage = episodeData.value?.headers?.brand?.logoImage

  // Handle Simplecast images which use 'url' instead of 'template'
  if (epImage && typeof epImage === "object") {
    const epImageIdentifier = epImage?.url || epImage?.template
    const showImageIdentifier = showImage?.url || showImage?.template

    return epImageIdentifier !== showImageIdentifier
      ? epImage
      : gallery.value?.slides?.[0]?.image || null
  }

  return epImage
}

const {
  data: show,
  error: showError,
  execute: executeShowFetch,
} = useLazyFetch(
  () => `${config.public.BFF_URL}/api/v2/show/${theSlug.value}`,
  {
    immediate: false,
    server: false,
  }
)

// episode image resize on scroll
const handleScroll = () => {
  const scrolled = window.scrollY > 0
  if (isMinimized.value !== scrolled) {
    isMinimized.value = scrolled
  }
}

let scrollTimeout = null
// debounce so the scroll event doesn't fire too often
const debouncedScroll = () => {
  clearTimeout(scrollTimeout)
  scrollTimeout = setTimeout(handleScroll, 20)
}

onMounted(() => {
  window.addEventListener("scroll", debouncedScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener("scroll", debouncedScroll)
  clearTimeout(scrollTimeout)
})

watch(
  status,
  () => {
    if (status.value === "success" && theSlug.value) {
      executeShowFetch()
    }
  },
  { immediate: false }
)
</script>

<template>
  <div class="episode-page">
    <Html lang="en">
      <Head>
        <Title>{{ episodeData?.title }} Transcript | WNYC</Title>
        <Meta
          name="og:title"
          :content="`${episodeData?.title} Transcript | WNYC`"
        />
        <Meta
          name="twitter:title"
          :content="`${episodeData?.title} Transcript | WNYC`"
        />
      </Head>
    </Html>
    <FetchError v-if="error" />
    <FetchError v-if="showError" />

    <section class="pinned mt-0 lg:mt-6" :class="{ isApp: isApp }">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div v-if="status === 'success'">
            <div class="flex flex-column align-items-start">
              <Button
                label="Episode Details"
                icon="pi pi-chevron-left"
                severity="info"
                @click="handleReturnToEpisode"
              />
              <div
                class="flex align-items-start gap-2 mt-4"
                :class="{ 'align-items-center': isMinimized }"
              >
                <VImage
                  :src="getEpisodeImage()"
                  :alt="episodeData?.title"
                  class="episode-page-image"
                  :class="{ minimize: isMinimized }"
                  :size="[112, 112]"
                />
                <h1 class="h2" :class="isMinimized ? 'mt-0' : 'mt-2'">
                  {{ episodeData?.title }}
                </h1>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-column align-items-start gap-4">
            <Skeleton height="36px" width="168px" borderRadius="18px" />
            <div
              class="flex gap-2 align-items-start w-full"
              :class="{ 'align-items-center': isMinimized }"
            >
              <Skeleton
                class="episode-page-image flex-none"
                :class="{ minimize: isMinimized }"
                :height="isMinimized ? '46px' : '112px'"
                :width="isMinimized ? '46px' : '112px'"
                borderRadius="0px"
              />
              <div
                class="flex flex-column gap-1 w-full"
                :class="isMinimized ? 'mt-0' : 'mt-3'"
              >
                <Skeleton height="13px" class="w-9" borderRadius="9px" />
                <Skeleton
                  height="13px"
                  class="md:hidden w-8"
                  borderRadius="9px"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="col-fixed hidden lg:block w-20rem"></div>
      </div>
    </section>
    <section class="py-0">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div v-if="status === 'success'">
            <div v-if="episodeData?.transcript">
              <div class="flex align-items-center gap-1">
                <h2>Transcript</h2>
                <Button
                  icon="pi pi-link"
                  severity="secondary"
                  link
                  @click="handleTranscriptLinkClick"
                />
              </div>
              <HtmlConvert
                :htmlContent="episodeData?.transcript"
                :key="`transcript-${episodeData?.id || route.params.slug}`"
              />
            </div>
          </div>
          <div v-else>
            <SkeletonText class="mb-2" />
            <SkeletonText />
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

<style lang="scss" scoped>
.episode-page {
  .pinned {
    position: sticky;
    z-index: 10;
    background-color: var(--header-background);
    -webkit-backdrop-filter: blur(4px);
    backdrop-filter: blur(4px);
    top: calc(var(--header-height) + env(safe-area-inset-top));
    @include media("<md") {
      &.isApp {
        top: env(safe-area-inset-top);
      }
    }
    .episode-page-image {
      transition: width var(--p-transition-duration),
        height var(--p-transition-duration);
      -webkit-transition: width var(--p-transition-duration),
        height var(--p-transition-duration);
      width: 112px;
      height: 112px;
      &.minimize {
        width: 46px;
        height: 46px;
      }
    }
  }
}
</style>
