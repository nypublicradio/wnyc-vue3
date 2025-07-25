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

const { data: show, status: showStatus, error: showError } = useFetch(
  `${config.public.BFF_URL}/api/v2/show/${theSlug.value}`
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
      <!-- <pre>show:{{ show }}</pre>
      <pre>episode:{{ episodeData }}</pre> -->
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

    <div class="show-header-holder py-3 md:py-6">
      <div class="grid">
        <div class="col-fixed hidden xxl:block w-20rem"></div>
        <div class="col pr-2 lg:pr-4">
          <div class="episode-page-image-holder relative mb-4">
            <VImage
              v-if="status == 'success'"
              :src="getEpisodeImage()"
              :size="{
                xs: [375, 250],
                sm: [576, 384],
                md: [768, 512],
                lg: [992, 661],
                xl: [1200, 800],
                xxl: [1340, 893],
              }"
              :alt="episodeData?.image?.altText"
              class="episode-page-image mb-2"
            />
            <Skeleton
              v-else
              borderRadius="0px"
              height="auto"
              class="episode-page-image mb-2 opacity-60"
            />
            <VImage
              v-if="status === 'success'"
              :src="episodeData?.headers.brand.logoImage"
              :size="[70, 70]"
              :alt="episodeData?.show"
              class="episode-page-show-image cursor-pointer"
              :aria-label="`More from ${theShowTitle} button`"
              :title="`More from ${theShowTitle}`"
              @click="moreFromClick"
            />
            <Skeleton
              v-else
              borderRadius="0px"
              height="70px"
              width="70px"
              class="episode-page-show-image absolute"
            />
          </div>
          <div v-if="status === 'success'">
            <div>
              <p class="episode-page-date my-1">
                {{ getDate(episodeData, "LLL d, yyyy") }}
              </p>
              <h1 class="mb-3 alt">{{ episodeData?.title }}</h1>
              <div
                class="flex align-items-center justify-content-between flex-wrap gap-3"
              >
                <div class="flex align-items-center gap-2">
                  <PlayButton
                    v-if="!hasSegments && hasAudio(episodeData?.audio)"
                    :label="getMinutes(episodeData?.estimatedDuration, 1)"
                    :data="episodeData"
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
                  <!--             <div v-else class="font-bold text-red-500">
              <i class="pi pi-exclamation-triangle mr-1"></i>No Audio
            </div> -->
                </div>
                <div class="flex gap-3 align-items-center">
                  <Button
                    class="w-2rem h-2rem"
                    text
                    plain
                    rounded
                    aria-label="star"
                    @click="handleAddToFavorites(episodeData)"
                  >
                    <template #icon> <StarIcon :active="isFavorited" /></template>
                  </Button>
                  <Button
                    v-if="hasAudio(episodeData?.audio)"
                    class="w-2rem h-2rem"
                    text
                    plain
                    rounded
                    aria-label="download"
                    @click="handleDownload(episodeData)"
                  >
                    <template #icon> <DownloadIcon /></template>
                  </Button>
                  <Button
                    class="w-2rem h-2rem"
                    text
                    plain
                    rounded
                    aria-label="share"
                    @click="handleShare"
                  >
                    <template #icon> <ShareIcon /></template>
                  </Button>
                  <DotMenu
                    :menuItems="getDotMenuItems(episodeData)"
                    label=""
                    @changeEmit="onMenuChange"
                    class="-mr-1"
                  >
                    <template #header-bottom>
                      <div>
                        <div class="flex gap-3 align-items-center px-4">
                          <VImage
                            :src="episodeData?.image || getEpisodeImage()"
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
              <!-- SEGMENTS -->
              <ol v-if="hasSegments" class="flex flex-column gap-3 mt-6 segment-list">
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
            <div v-if="episodeData?.transcript">
              <h3 class="mb-4">Transcript</h3>
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
    </div>

    <BackToTopButton />
  </div>
</template>

<style lang="scss">
.episode-page .episode-page-image {
  width: 100%;
  aspect-ratio: 3/2;
}

.episode-page .episode-page-show-image {
  width: 72px;
  height: 72px;
  aspect-ratio: 1/1;
  position: absolute;
  bottom: -36px;
  left: $padding;
}

.episode-page .episode-page-date {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-6);
  color: var(--p-text-color);
  text-decoration: none;
  opacity: 70%;
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
