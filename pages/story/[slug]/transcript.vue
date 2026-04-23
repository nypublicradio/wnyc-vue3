<script setup>
import { useToast } from "primevue/usetoast"
import {
  trackClickEvent,
  togglePlayEpisode,
  copyToClipBoard,
  getFirstSentence,
  stripHtmlTags,
} from "~/utilities/helpers"
import { useIsApp } from "~/composables/states"
import { mediaTypeRoutes } from "~/composables/globals"
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const toast = useToast()
const isMinimized = ref(false)
const isApp = useIsApp()
definePageMeta({
  pageTransition: false,
})
const cmsSource = computed(() => route.params.cmsSource || "publisher")
const { data: episode, status, error } = await useFetchWrapper(
  () =>
    `${config.public.BFF_URL}/api/v2/show/episode/${cmsSource.value}/${route.params.slug}`,
  {
    key: `transcript-episode-${cmsSource.value}-${route.params.slug}`,
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

onMounted(() => {
  if (!episode.value) return
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: episode.value.title,
    page_type: "episode_page",
    content_group: "on_demand_episode_transcript",
    article_authors: episode.value?.authors?.map((author) => author.name).join(","),
    article_publish_date: episode.value.publicationDate,
    article_updated_date: episode.value.updatedDate
      ? episode.value.updatedDate
      : episode.value.publicationDate,
    article_title: episode.value.title,
  })

  // check route param autoplay exists and if so, play the first segment
  if (route.query.autoplay === "true") {
    togglePlayEpisode(episode.value.audio[0])
    // remove the autoplay query param
    router.replace({ query: { ...route.query, autoplay: null } })
  }
})

// const theSlug = computed(
//   () =>
//     episode.value?.showSlug || episode.value?.show || episode.value?.headers?.brand?.slug
// )
const backToEpisodePath = computed(() => `${mediaTypeRoutes.story}${route.params.slug}`)
// handle returning / routing to the full episode page
const handleReturnToEpisode = () => {
  trackClickEvent(
    "Click Tracking - Return to Episode from transcript",
    "Episode transcript",
    backToEpisodePath.value
  )
  navigateTo(backToEpisodePath.value)
}

// handle transcript link click
const handleTranscriptLinkClick = () => {
  trackClickEvent("Click Tracking - Transcript Link", "Episode slug", route.fullPath)
  copyToClipBoard(`${window.location.href}`, "Transcript link copied to clipboard")
}

// get the image for the episode. if the episode image is the same as the show image, use the fallback image
const getEpisodeImage = () => {
  const epImage = episode.value?.image
  const showImage = episode.value?.headers?.brand?.logoImage

  // Handle Simplecast images which use 'url' instead of 'template'
  if (epImage && typeof epImage === "object") {
    const epImageIdentifier = epImage?.url || epImage?.template
    const showImageIdentifier = showImage?.url || showImage?.template

    return epImageIdentifier !== showImageIdentifier
      ? epImage
      : episode.value?.gallery?.value?.slides?.[0]?.image || null
  }

  return epImage
}

// const { data: showSlug } = await useFetchWrapper(
//   () =>
//     theSlug.value
//       ? `${config.public.BFF_URL}/api/v2/show/${theSlug.value}?slugOnly=true`
//       : null,
//   {
//     key: `v2-show-only-${theSlug.value}`,
//   }
// )

// const { data: show, status: showStatus } = await useFetchWrapper(
//   () =>
//     showSlug.value?.show?.slug
//       ? `${config.public.BFF_URL}/api/pages/wagtail/${showSlug.value?.show?.slug}?showOnly=true`
//       : null,
//   {
//     key: `wagtail-show-only-${showSlug.value?.show?.slug}`,
//   }
// )

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

const breadcrumbs = computed(() => [{ label: "Home", route: "/home" }])

onMounted(() => {
  window.addEventListener("scroll", debouncedScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener("scroll", debouncedScroll)
  clearTimeout(scrollTimeout)
})

const title = `${episode.value?.title} | WNYC`
const tease =
  episode.value?.tease ?? getFirstSentence(stripHtmlTags(episode.value?.tease))
const description =
  episode.value?.description ??
  getFirstSentence(stripHtmlTags(episode.value?.description))
useHead({
  title,
})
useSeoMeta({
  title,
  description: tease ?? description,
})
</script>

<template>
  <div class="transcript-page">
    <section>
      <transition name="fade">
        <div v-if="status === 'success'" class="flex align-items-center mb-4">
          <Breadcrumbs :items="breadcrumbs" />
        </div>
      </transition>
    </section>
    <FetchError v-if="error" />

    <section class="pinned mt-0" :class="{ isApp: isApp }">
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
                class="flex align-items-center md:align-items-start gap-3 mt-4"
                :class="{ 'align-items-center': isMinimized }"
              >
                <VImage
                  :src="getEpisodeImage()"
                  :size="{
                    xxs: [112, 112],
                  }"
                  :allowVerticalEffect="false"
                  :ratio="[1, 1]"
                  :alt="episode?.image?.altText || episode?.title"
                  class="episode-page-image flex-none w-7rem md:w-7rem"
                  :class="{ minimize: isMinimized }"
                >
                </VImage>

                <h1
                  class="text-xl -mt-1 md:mt-0 line-height-1 md:line-height-2"
                  :class="isMinimized ? 'mt-0 md:text-2xl' : 'mt-2 md:text-4xl'"
                >
                  {{ episode?.title }}
                </h1>
              </div>
            </div>
          </div>
          <div v-else class="flex flex-column align-items-start gap-4 mt-0 lg:mt-6">
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
                <Skeleton height="13px" class="md:hidden w-8" borderRadius="9px" />
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
            <div v-if="episode?.transcript">
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
                :htmlContent="episode?.transcript"
                :key="`transcript-${episode?.id || route.params.slug}`"
              />
            </div>
          </div>
          <div v-else>
            <SkeletonText class="mb-2" />
            <SkeletonText />
          </div>
        </div>
        <div class="col-fixed hidden lg:block w-20rem">
          <ShowSummary v-if="showStatus === 'pending' || show" :show="show" />
        </div>
      </div>
    </section>

    <BackToTopButton />
  </div>
</template>

<style lang="scss" scoped>
.transcript-page {
  min-height: 95vh;
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
      transition: width var(--p-transition-duration), height var(--p-transition-duration);
      -webkit-transition: width var(--p-transition-duration),
        height var(--p-transition-duration);
      &.minimize {
        width: 46px !important;
        height: 46px !important;
      }
    }
  }
}
</style>
