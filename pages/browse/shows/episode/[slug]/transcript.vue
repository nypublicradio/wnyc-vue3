<script setup>
import { useCurrentUser, useCurrentEpisode, useGlobalToast } from "~/composables/states"
import { isAlreadyDownloaded, fetchAndStoreMp3 } from "~/utilities/file-system"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import SleepIcon from "~/components/icons/SleepIcon.vue"
import MoreEpisodesIcon from "~/components/icons/MoreEpisodesIcon.vue"
import {
  getMinutes,
  trackClickEvent,
  getDate,
  togglePlayEpisode,
  checkIsFavorited,
  shareAPI,
  addToFavorites2,
  getEpisodeHeadFallBackImage,
  hasAudio,
} from "~/utilities/helpers"
import useSleepTimer from "~/composables/useSleepTimer"
const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()
const { $analytics } = useNuxtApp()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const currentEpisode = useCurrentEpisode()
const user = useCurrentUser()
const globalToast = useGlobalToast()
const progress = ref({})

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

const theShowTitle = computed(
  () =>
    episodeData.value?.showTitle ||
    episodeData.value?.headers.brand.title ||
    episodeData.value?.title
)

const hasSegments = computed(() => Array.isArray(episodeData.value?.audio))

// navigate back to home and track it
const backHome = () => {
  trackClickEvent("episode", "episode page", "back show page")
  router.go(-1)
}

// handle the download of the audio file or multiple files request and feed the progress
const handleDownload = async (epD) => {
  trackClickEvent("Click Tracking - Audio Download", "Episode slug", epD.title)
  progress.value = await fetchAndStoreMp3(epD)
}

//handle the share of the episode
const handleShare = () => {
  shareAPI(episodeData.value, "episode slug")
}

//handle the transcript of the episode
const handleTranscript = () => {
  //??
}

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// add item to favorites
const handleAddToFavorites = (bucketItem) => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: bucketItem,
    isFavorited: isFavorited.value,
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}

// handles the click on the show image and dots menu
const moreFromClick = () => {
  trackClickEvent(
    "Click Tracking - Show image",
    `Episode slug page: ${theSlug.value}`,
    theShowTitle.value
  )
  navigateTo(`/browse/shows/${theSlug.value}`)
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: `${isFavorited.value ? "Unfavorite Episode" : "Favorite Episode"}`,
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem?.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    ...(hasAudio(bucketItem?.audio)
      ? [
          {
            label: `Download ${
              bucketItem.segments && Array.isArray(bucketItem?.audio) ? "All" : ""
            }`,
            //icon: 'pi pi-google',
            customIcon: DownloadIcon,
            title: bucketItem?.title,
            command: () => {
              handleDownload(bucketItem)
            },
          },
        ]
      : []),
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem?.title,
      command: () => {
        handleShare()
      },
    },
    {
      label: "More episodes",
      customIcon: MoreEpisodesIcon,
      title: bucketItem?.title,
      command: () => {
        moreFromClick()
      },
    },
    {
      label: "Sleep Timer",
      customIcon: SleepIcon,
      active: sleepTimerRunning.value,
      title: currentEpisode.value?.title ?? "No audio playing",
      command: () => {
        handleSleepTimer()
      },
    },
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e?.value?.command()
}

// handle the toggle play button and tracking
const togglePlayHere = (epData, index = 0) => {
  togglePlayEpisode(epData, index)
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
        <Title>{{ episodeData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${episodeData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${episodeData?.title} | WNYC`" />
      </Head>
    </Html>
    <FetchError v-if="error" />

    <section class="py-3 md:py-6">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div v-if="status === 'success'">
            <div v-if="episodeData?.transcript">
              <div class="flex align-items-center gap-2 flex-wrap">
                <Button
                  label="Episode Details"
                  icon="pi pi-chevron-left"
                  severity="info"
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
              <h3 class="mt-4">Transcript</h3>
              <HtmlConvert
                :htmlContent="episodeData?.transcript"
                :key="`transcript-${episodeData?.id || route.params.slug}`"
              />
            </div>
          </div>
          <div v-else>
            <Skeleton
              height="12px"
              width="75px"
              borderRadius="16px"
              class="mb-2 opacity-50"
            />
            <Skeleton height="1.25rem" width="95%" borderRadius="16px" class="mb-1" />
            <Skeleton height="1.25rem" width="75%" borderRadius="16px" class="mb-1" />
            <div class="flex justify-content-between mt-4 mb-5">
              <div>
                <Skeleton height="29px" width="92px" borderRadius="16px" />
              </div>
              <div class="flex gap-3">
                <Skeleton height="29px" width="29px" borderRadius="16px" />
                <Skeleton height="29px" width="29px" borderRadius="16px" />
                <Skeleton height="29px" width="29px" borderRadius="16px" />
                <Skeleton height="29px" width="29px" borderRadius="16px" />
              </div>
            </div>
            <skeleton-text :lines="6" class="mt-1" />
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

<style lang="scss">
.episode-page .episode-page-image {
  width: 100%;
  aspect-ratio: 3/2;
}

.episode-page .episode-page-date {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-6);
  color: var(--p-text-color);
  text-decoration: none;
}
.episode-page .segment-list .beforeHack {
  &::before {
    content: "";
    display: block;
    height: 0px;
  }
}

.episode-page h1.alt {
  font-family: var(--font-family-header);
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-600);
  line-height: var(--font-size-10);
}

.episode-page .star-icon {
  height: 28px;
  width: 28px;
}
</style>
