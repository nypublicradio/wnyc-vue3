<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import { useCurrentUser } from "~/composables/states"
import { isAlreadyDownloaded, fetchAndStoreMp3 } from "~/utilities/file-system"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
//import QueueIcon from "~/components/icons/QueueIcon.vue"
//import FollowIcon from "~/components/icons/FollowIcon.vue"
//import MoreEpisodesIcon from "~/components/icons/MoreEpisodesIcon.vue"
import {
  getMinutes,
  trackClickEvent,
  getDate,
  togglePlayEpisode,
  checkIsFavorited,
  shareAPI,
  addToFavorites,
  getEpisodeHeadFallBackImage,
} from "~/utilities/helpers"

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()

const { data: episode, pending, error, refresh } = useFetch(
  `${config.public.BFF_URL}/api/show/episode/${route.params.slug}`
)

const episodeData = ref(episode?.value ?? null)

const user = useCurrentUser()

// navigate back to home and track it
const backHome = () => {
  trackClickEvent("episode", "episode page", "back show page")
  router.go(-1)
}

const progress = ref({})
// handle the download of the audio file or multiple files request and feed the progress
const handleDownload = async (epD) => {
  trackClickEvent("Click Tracking - Audio Download", "Episode slug", epD.title)
  progress.value = await fetchAndStoreMp3(epD)
}

const handleShare = () => {
  shareAPI(episodeData.value, "episode slug")
}

// const handleFollow = () => {
//   // follow the show
// }

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// add item to favorites
const handleAddToFavorites = (bucketItem) => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites(bucketItem, isFavorited.value)
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}

// const handleAddToQueue = (bucketItem) => {
//   // toggle active state
//   // update SB and LS with new state
//   trackClickEvent("Click Tracking - Add to Queue", "Episode Slug", bucketItem.title)
// }

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Favorite Episode",
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem?.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    {
      label: `Download ${
        bucketItem.segments && Array.isArray(bucketItem.audio) ? "All" : ""
      }`,
      //icon: 'pi pi-google',
      customIcon: DownloadIcon,
      title: bucketItem?.title,
      command: () => {
        handleDownload(bucketItem)
      },
    },
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem?.title,
      command: () => {
        handleShare()
      },
    },
    // {
    //   label: "Follow",
    //   customIcon: FollowIcon,
    //   title: bucketItem?.title,
    //   command: () => {
    //     handleFollow()
    //   },
    // },
    // {
    //   label: "Add to Queue",
    //   active: true,
    //   customIcon: QueueIcon,
    //   title: bucketItem?.title,
    //   command: () => {
    //     handleAddToQueue(bucketItem)
    //   },
    // },
    // {
    //   label: "More episodes",
    //   customIcon: MoreEpisodesIcon,
    //   title: bucketItem?.title,
    //   command: () => {
    //     handleFollow()
    //   },
    // },
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

// handle the toggle play button and tracking
const togglePlayHere = (epData, index = 0) => {
  togglePlayEpisode(epData, index)
}

watch(episode, () => {
  episodeData.value = episode.value

  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: episodeData.value.title,
    page_type: "episode_page",
    content_group: "on_demand_episode",
    article_authors: episodeData.value?.authors?.map((author) => author.name).join(","),
    article_publish_date: episodeData.value.publicationDate,
    article_updated_date: episodeData.value.updatedDate
      ? episodeData.value.updatedDate
      : episodeData.value.publicationDate,
    article_title: episodeData.value.title,
  })
})

const isSegment = computed(
  () =>
    Array.isArray(episodeData.value.audio) && Array.isArray(episodeData.value.segments)
)

// get the image for the episode. if the episode image is the same as the show image, use the fallback image
const getEpisodeImage = computed(() => {
  const epImage = episodeData.value?.image?.template
  const showImage = episodeData.value?.headers.brand.logoImage.template
  return epImage !== showImage ? epImage : getEpisodeHeadFallBackImage()
})
</script>

<template>
  <div class="episode-page">
    <Html lang="en">
      <Head>
        <Title>{{ episodeData?.title }} | WNYC</Title>
        <Meta name="og:title" content="{{episodeData?.title}} | WNYC" />
        <Meta name="twitter:title" content="{{episodeData?.title}} | WNYC" />
      </Head>
    </Html>
    <!--  <pre class="text-xs">{{ episodeData }}</pre> -->
    <section class="">
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
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
    <FetchError v-if="error || !episodeData || episodeData === undefined" />
    <div class="relative mb-4">
      <v-image
        v-if="!pending"
        :src="getEpisodeImage"
        :width="390"
        :height="360"
        :ratio="[3, 2]"
        :srcset="[2]"
        :alt="episodeData?.image.altText"
        class="episode-page-image mb-2"
      />
      <Skeleton
        v-else
        borderRadius="0px"
        height="auto"
        class="episode-page-image mb-2 opacity-60"
      />
      <v-image
        v-if="!pending"
        :src="episodeData?.headers.brand.logoImage.template"
        :width="70"
        :height="70"
        :srcset="[2]"
        :ratio="[1, 1]"
        :alt="episodeData?.show"
        class="episode-page-show-image mb-2"
      />
      <Skeleton
        v-else
        borderRadius="0px"
        height="70px"
        width="70px"
        class="episode-page-show-image mb-2 absolute"
      />
    </div>
    <div v-if="!pending">
      <section>
        <p class="episode-page-date my-1">
          {{ getDate(episodeData, "LLL d, yyyy") }}
        </p>
        <h1 class="mb-3 alt">{{ episodeData?.title }}</h1>
        <div class="flex align-items-center justify-content-between flex-wrap gap-3">
          <div class="flex align-items-center gap-2">
            <PlayButton
              v-if="!isSegment"
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
          <div class="flex gap-3">
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
              width="32px"
              height="32px"
              class="-mr-1"
            >
              <template #header-bottom>
                <div>
                  <div class="flex gap-3 px-4 align-items-center">
                    <VImage
                      :src="episodeData?.image.template"
                      :alt="`${episodeData?.title} show image`"
                      :width="116"
                      :height="116"
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
        <div v-if="isSegment" class="flex flex-column gap-3 mt-4">
          <div v-for="(segment, index) in episodeData?.segments" :key="segment.title">
            <div v-if="episodeData?.audio[index]" class="flex gap-3 align-items-center">
              <PlayButton
                :label="segment.audioDurationReadable"
                :data="episodeData"
                :index="index"
                @onClick="togglePlayHere(episodeData, index)"
              />
              <p class="truncate t2lines">{{ segment.title }}</p>
            </div>
          </div>
        </div>
        <HtmlConvert :htmlContent="episodeData?.body" class="mt-5" />
      </section>
      <section v-if="episodeData?.transcript">
        <h3 class="mb-4">Transcript</h3>
        <HtmlConvert :htmlContent="episodeData?.transcript" />
      </section>
    </div>
    <section v-else>
      <Skeleton height="12px" width="75px" borderRadius="16px" class="mb-2 opacity-50" />
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
    </section>

    <BackToTopButton />
  </div>
</template>

<style lang="scss">
.episode-page .episode-page-image {
  width: 100%;
  height: auto;
  aspect-ratio: 3/2;
  object-fit: cover;
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
  color: var(--text-color);
  text-decoration: none;
  opacity: 70%;
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
