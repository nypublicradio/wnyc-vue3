<script setup>
import { useGlobalToast } from "~/composables/states"
import {
  trackClickEvent,
  togglePlayEpisode,
  checkIsFavorited,
  getEpisodeHeadFallBackImage,
} from "~/utilities/helpers"

const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const globalToast = useGlobalToast()

definePageMeta({
  pageTransition: false,
})

const { data: episode, status, error } = useFetch(
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
        article_updated_date: res.updatedDate ? res.updatedDate : res.publicationDate,
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
      globalToast.value = {
        severity: "error",
        summary:
          "We are having a problem loading this episode's transcript. Please try again later.",
        life: 6000,
        closable: true,
      }
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
    "Click Tracking - Return to Episode",
    "Episode slug",
    `/browse/shows/episode/${route.params.slug}`
  )
  navigateTo(
    `/browse/shows/episode/${route.params.slug}?src=${route.query.src}&type=${route.query.type}`
  )
}

// get the image for the episode. if the episode image is the same as the show image, use the fallback image
const getEpisodeImage = () => {
  const epImage = episodeData.value?.image
  const showImage = episodeData.value?.headers.brand.logoImage
  return epImage
    ? epImage.template !== showImage.template
      ? epImage
      : getEpisodeHeadFallBackImage()
    : getEpisodeHeadFallBackImage()
}

const {
  data: show,
  status: showStatus,
  error: showError,
  execute: executeShowFetch,
} = useLazyFetch(() => `${config.public.BFF_URL}/api/v2/show/${theSlug.value}`, {
  immediate: false,
  server: false,
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
        <Meta name="og:title" :content="`${episodeData?.title} Transcript | WNYC`" />
        <Meta name="twitter:title" :content="`${episodeData?.title} Transcript | WNYC`" />
      </Head>
    </Html>
    <FetchError v-if="error" />

    <section class="pinned mt-6">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div v-if="status === 'success'">
            <div class="flex align-items-center gap-2 flex-wrap">
              <Button
                label="Episode Details"
                icon="pi pi-chevron-left"
                severity="info"
                @click="handleReturnToEpisode"
              />
              <div class="flex align-items-center gap-2">
                <VImage
                  :src="getEpisodeImage()"
                  :alt="episodeData?.title"
                  class="episode-page-image"
                  :size="[37, 37]"
                  style="width: 37px; height: 37px"
                />
                <h2>{{ episodeData?.title }}</h2>
              </div>
            </div>
          </div>
          <div v-else class="flex align-items-center gap-2">
            <Skeleton height="36px" width="168px" borderRadius="18px" />
            <Skeleton height="37px" width="37px" borderRadius="0px" />
            <Skeleton height="18px" width="220px" borderRadius="18px" />
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
              <h3 class="mt-4">Transcript</h3>
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
    top: var(--header-height);
    z-index: 10;
    background-color: var(--header-background);
  }
}
</style>
