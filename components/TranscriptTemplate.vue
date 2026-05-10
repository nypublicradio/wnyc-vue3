<script setup>
import {
  trackClickEvent,
  copyToClipBoard,
} from "~/utilities/helpers"
import { useIsApp } from "~/composables/states"

const props = defineProps({
  status: { type: String, required: true },
  error: { type: Object, default: null },
  episode: { type: Object, required: false },
  show: { type: Object, required: false },
  showStatus: { type: String, required: false, default: "success" },
  breadcrumbs: { type: Array, required: true },
  backToEpisodePath: { type: String, required: true },
})

const route = useRoute()
const isMinimized = ref(false)
const isApp = useIsApp()

// handle returning / routing to the full episode page
const handleReturnToEpisode = () => {
  trackClickEvent(
    "Click Tracking - Return to Episode from transcript",
    "Episode transcript",
    props.backToEpisodePath
  )
  navigateTo(props.backToEpisodePath)
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
  const epImage = props.episode?.image
  const showImage = props.episode?.headers?.brand?.logoImage

  // Handle Simplecast images which use 'url' instead of 'template'
  if (epImage && typeof epImage === "object") {
    const epImageIdentifier = epImage?.url || epImage?.template
    const showImageIdentifier = showImage?.url || showImage?.template

    return epImageIdentifier !== showImageIdentifier
      ? epImage
      : props.episode?.gallery?.value?.slides?.[0]?.image || null
  }

  return epImage
}

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
</script>

<template>
  <div class="transcript-template">
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
          <div
            v-else
            class="flex flex-column align-items-start gap-4 mt-0 lg:mt-6"
          >
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
.transcript-template {
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
      transition: width var(--p-transition-duration),
        height var(--p-transition-duration);
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
