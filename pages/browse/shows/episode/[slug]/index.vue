<script setup>
import { useCurrentUser, useCurrentEpisode, useGlobalToast } from "~/composables/states"
import { useBreakpoints } from "~/composables/useBreakpoints"
import { isAlreadyDownloaded, fetchAndStoreMp3 } from "~/utilities/file-system"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import TranscriptIcon from "~/components/icons/TranscriptIcon.vue"
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

// Use the shared breakpoint composable
const { breakpoint } = useBreakpoints()
const isMobileBtn = computed(() => breakpoint("<md"))

const { data: episode, status, error } = useFetch(
  `${config.public.BFF_URL}/api/v2/show/episode/${route.query.src}/${route.params.slug}`,
  {
    onResponse({ response }) {
      const res = response._data
      $analytics.sendPageView({
        page_title: res.title,
        page_type: "episode_page",
        content_group: "on_demand_episode",
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
        summary: "We are having a problem loading this episode. Please try again later.",
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
  navigateTo(
    `./${route.params.slug}/transcript?src=${route.query.src}&type=${route.query.type}`
  )
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
    ...(bucketItem?.transcript
      ? [
          {
            label: "Transcript",
            //icon: 'pi pi-google',
            customIcon: TranscriptIcon,
            title: bucketItem?.title,
            command: () => {
              handleTranscript()
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

const theEpImage = computed(() => getEpisodeImage())

const { data: show, error: showError, execute: executeShowFetch } = useLazyFetch(
  () => `${config.public.BFF_URL}/api/v2/show/${theSlug.value}`,
  {
    immediate: false,
    server: false,
  }
)

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
    <section>
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="backHome"
          label="Back"
        />
      </div>
    </section>
    <FetchError v-if="error" />
    <FetchError v-if="showError" />

    <section class="py-3 md:py-6">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <h1 class="mb-3 text-2xl md:text-6xl line-height-2">
            {{ episodeData?.title }}
          </h1>
          <!-- <p class="episode-page-date my-1">
            {{ getDate(episodeData, "LLL d, yyyy") }}
          </p> -->

          <PipeData class="text-sm">
            <template #left>{{ episodeData?.showTitle }}</template>
            <template #right>
              <span class="nobreak">{{ getDate(episodeData, "LLL d, yyyy") }}</span>
            </template>
          </PipeData>
          <div
            class="pt-4 pb-2 lg:pb-6 flex align-items-center justify-content-start flex-wrap gap-3"
          >
            <div class="flex align-items-center gap-2">
              <PlayButton
                v-if="!hasSegments && hasAudio(episodeData?.audio)"
                :label="getMinutes(episodeData?.estimatedDuration, 1)"
                :data="episodeData"
                severity="primary"
                @onClick="togglePlayHere(episodeData)"
              />

              <DownloadProgress
                v-if="
                  (progress && Object.keys(progress).length > 0) ||
                  isAlreadyDownloaded(episodeData)
                "
                :isDownloaded="isAlreadyDownloaded(episodeData)"
                :progress="progress"
              />
            </div>
            <div class="flex gap-3 align-items-center">
              <Button
                :text="false"
                :label="isMobileBtn ? '' : 'Add to Favorites'"
                :size="isMobileBtn ? '' : 'small'"
                severity="secondary"
                plain
                rounded
                aria-label="star"
                @click="handleAddToFavorites(episodeData)"
              >
                <template #icon>
                  <StarIcon :active="isFavorited" class="w-1rem h-1rem"
                /></template>
              </Button>
              <Button
                v-if="hasAudio(episodeData?.audio)"
                :text="false"
                :label="isMobileBtn ? '' : 'Download'"
                :size="isMobileBtn ? '' : 'small'"
                severity="secondary"
                plain
                rounded
                aria-label="download"
                @click="handleDownload(episodeData)"
              >
                <template #icon> <DownloadIcon class="w-1rem h-1rem" /></template>
              </Button>
              <!-- <Button class="" text plain rounded aria-label="share" @click="handleShare">
                <template #icon> <ShareIcon /></template>
              </Button> -->
              <Button
                v-if="episodeData?.transcript"
                :text="false"
                :label="isMobileBtn ? '' : 'Transcript'"
                :size="isMobileBtn ? '' : 'small'"
                severity="secondary"
                plain
                rounded
                aria-label="transcript"
                @click="handleTranscript"
              >
                <template #icon> <TranscriptIcon class="w-1rem h-1rem" /></template>
              </Button>
              <DotMenu
                :menuItems="getDotMenuItems(episodeData)"
                label=""
                @changeEmit="onMenuChange"
                class="-mr-1"
                :isText="false"
                size="small"
              >
                <template #header-bottom>
                  <div>
                    <div class="flex gap-3 align-items-center px-4">
                      <VImage
                        :src="episodeData?.image || theEpImage"
                        :alt="`${episodeData?.title} show image`"
                        :width="112"
                        :height="112"
                        class="show-image-in-menu flex-none"
                        :ratio="[1, 1]"
                        style="height: 60px; width: 60px"
                      />

                      <div class="info">
                        <h2>{{ episodeData?.title }}</h2>
                        <p>{{ episodeData?.showTitle }}</p>
                      </div>
                    </div>
                    <hr class="mt-5 mb-2 dim" />
                  </div>
                </template>
              </DotMenu>
            </div>
          </div>
        </div>
        <div class="col-fixed hidden lg:block w-20rem"></div>
      </div>
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div v-if="theEpImage" class="episode-page-image-holder relative mb-4">
            <VImage
              v-if="status == 'success'"
              :src="theEpImage"
              :size="{
                xs: [327, 218],
                sm: [528, 352],
                md: [672, 448],
                lg: [560, 373],
                xl: [933, 621],
                xxl: [688, 458],
              }"
              :maxHeight="episodeData?.imageFullHeight"
              :maxWidth="episodeData?.imageFullWidth"
              allowVerticalEffect
              :alt="episodeData?.image?.altText"
              class="episode-page-image mb-2"
            />
            <Skeleton
              v-else
              borderRadius="0px"
              height="auto"
              class="episode-page-image mb-2 opacity-60"
            />
          </div>
          <div v-if="status === 'success'">
            <div>
              <!-- SEGMENTS -->
              <ol v-if="hasSegments" class="flex flex-column gap-3 mt-5 segment-list">
                <li
                  v-for="segment in episodeData?.audio"
                  class="mb-3 pr-0 beforeHack"
                  :key="segment.id"
                >
                  <MediaCard
                    :data="segment"
                    isSegment
                    showPlayButton
                    is-horizontal
                    :show-image="false"
                    imgCol="w-7rem"
                    :showBg="false"
                    :showBgMobile="false"
                  />
                </li>
              </ol>
              <HtmlConvert
                v-if="episodeData?.body"
                :htmlContent="episodeData?.body"
                class="mt-5"
                :key="`body-${episodeData?.id || route.params.slug}`"
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
</style>
