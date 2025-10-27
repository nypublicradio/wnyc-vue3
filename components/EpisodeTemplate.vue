<script setup>
import { useCurrentUser, useCurrentEpisode, useIsApp } from "~/composables/states"
import { useBreakpoints } from "~/composables/useBreakpoints"
import { isAlreadyDownloaded, fetchAndStoreMp3 } from "~/utilities/file-system"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import TranscriptIcon from "~/components/icons/TranscriptIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import SleepIcon from "~/components/icons/SleepIcon.vue"
import MoreEpisodesIcon from "~/components/icons/MoreEpisodesIcon.vue"
import CommentsIcon from "~/components/icons/CommentsIcon.vue"
import { normalizeGalleryPage } from "~/composables/data/galleryPages"
import { useCommentCounts, useUpdateCommentCounts } from "~/composables/comments"
import {
  getMinutes,
  trackClickEvent,
  getDate,
  togglePlayEpisode,
  checkIsFavorited,
  shareAPI,
  addToFavorites2,
  hasAudio,
} from "~/utilities/helpers"
import useSleepTimer from "~/composables/useSleepTimer"

const props = defineProps({
  pending: {
    type: Boolean,
    default: true,
  },
  episodeData: {
    type: Object,
    default: null,
  },
  show: {
    type: Object,
    default: null,
  },
})

const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()
const route = useRoute()
const currentEpisode = useCurrentEpisode()
const user = useCurrentUser()
const isApp = useIsApp()
const progress = ref({})

// Use the shared breakpoint composable
const { breakpoint } = useBreakpoints()
const isMobileBtn = computed(() => breakpoint("<md"))

const isWagtail = route.query.src === cmsSources.WAGTAIL
const storySource = computed(() =>
  isWagtail
    ? `Gothamist${
        props.episodeData?.section?.name ? `-${props.episodeData.section.name}` : ""
      }`
    : props.episodeData?.headers?.brand?.title || "WNYC"
)

const gallery = computed(async () => {
  if (props.episodeData?.leadGallery) {
    return await usePageById(props.episodeData?.leadGallery.gallery).then(({ data }) =>
      normalizeGalleryPage(data.value)
    )
  }
})
const galleryLength = computed(() => {
  if (props.episodeData?.leadGallery) {
    return gallery.value?.slides?.length ?? 0
  }
})
const galleryLink = computed(() => {
  if (props.episodeData?.leadGallery) {
    return String(
      `photos/${res?.leadGallery.gallery}?article=${res?.id}&src=${route.query.src}`
    )
  }
})
if (isWagtail) {
  // get comment count if Wagtail only
  useUpdateCommentCounts([props.episodeData])
}
const commentCounts = ref(useCommentCounts())
const commentCount = computed(() => {
  const result = commentCounts.value[props.episodeData?.commentId]
  return result ?? 0
})

const theSlug = computed(
  () =>
    props.episodeData?.showSlug ||
    props.episodeData?.show ||
    props.episodeData?.headers?.brand?.slug
)

const theShowTitle = computed(
  () =>
    props.episodeData?.showTitle ||
    props.episodeData?.headers?.brand?.title ||
    props.episodeData?.title
)

const hasSegments = computed(() => Array.isArray(props.episodeData?.audio))
// handle the toggle play button and tracking

// handle the download of the audio file or multiple files request and feed the progress
const handleDownload = async (epD) => {
  trackClickEvent("Click Tracking - Audio Download", "Episode slug", epD.title)
  progress.value = await fetchAndStoreMp3(epD)
}

//handle the share of the episode
const handleShare = () => {
  shareAPI(props.episodeData, "episode slug")
}

//handle the transcript of the episode
const handleTranscript = () => {
  navigateTo(
    `./${route.params.slug}/transcript?src=${route.query.src}&type=${route.query.type}`
  )
}

// handle comments button click
const handleComments = () => {
  const activeStation = document.getElementById("comments")
  activeStation.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "start",
  })
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e?.value?.command()
}

const togglePlayHere = (epData, index = 0) => {
  togglePlayEpisode(epData, index)
}

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

// get the image for the episode. if the episode image is the same as the show image, use the fallback image
const getEpisodeImage = () => {
  const epImage = props.episodeData?.image
  const showImage = props.episodeData?.headers?.brand?.logoImage

  return epImage && typeof epImage === "object"
    ? epImage?.template !== showImage?.template
      ? epImage
      : epImage || gallery.value?.slides?.[0]?.image || null
    : epImage
}

const theEpImage = computed(() => getEpisodeImage())
const theEpImageCaption = computed(() => {
  return (
    props.episodeData?.leadImageCaption ??
    theEpImage?.caption ??
    gallery.value?.slides?.[0]?.image.caption ??
    null
  )
})
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
    ...(isApp.value
      ? [
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
      : []),
  ]
}
watch(
  () => props.episodeData,
  () => {
    console.log("episodeData in EpisodeTemplate:", props.episodeData)
  }
)
</script>

<template>
  <section class="episode-template">
    <div class="grid">
      <div class="col-fixed hidden xxl:block w-20rem"></div>
      <div v-if="!props.pending" class="col pr-2 lg:pr-4">
        <h1 class="text-2xl md:text-6xl line-height-2">
          {{ props.episodeData?.title }}
        </h1>
        <div class="npr-story-page-author opacity-70 text-xs">
          <VByline
            v-if="props.episodeData?.authors?.length > 0"
            :authors="props.episodeData?.authors"
          />
        </div>
        <!-- :hide-pipe="!!!props.episodeData?.showTitle" -->
        <PipeData class="text-sm mt-3">
          <template #left>{{ props.episodeData?.showTitle || storySource }}</template>
          <template #right>
            <span class="nobreak inline-flex gap-1"
              >{{ getDate(props.episodeData, "LLL d, yyyy") }}
            </span>
          </template>
        </PipeData>
        <div
          class="pt-4 pb-2 lg:pb-6 flex align-items-center justify-content-start flex-wrap gap-3"
        >
          <div
            v-if="!hasSegments && hasAudio(props.episodeData?.audio)"
            class="flex align-items-center gap-2"
          >
            <PlayButton
              v-if="!hasSegments && hasAudio(props.episodeData?.audio)"
              :label="getMinutes(props.episodeData?.estimatedDuration, 1)"
              :data="props.episodeData"
              severity="primary"
              @onClick="togglePlayHere(props.episodeData)"
            />

            <DownloadProgress
              v-if="
                (progress && Object.keys(progress).length > 0) ||
                isAlreadyDownloaded(props.episodeData)
              "
              :isDownloaded="isAlreadyDownloaded(props.episodeData)"
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
              @click="handleAddToFavorites(props.episodeData)"
            >
              <template #icon>
                <StarIcon :active="isFavorited" class="w-1rem h-1rem"
              /></template>
            </Button>
            <Button
              v-if="hasAudio(props.episodeData?.audio)"
              :text="false"
              :label="isMobileBtn ? '' : 'Download'"
              :size="isMobileBtn ? '' : 'small'"
              severity="secondary"
              plain
              rounded
              aria-label="download"
              @click="handleDownload(props.episodeData)"
            >
              <template #icon> <DownloadIcon class="w-1rem h-1rem" /></template>
            </Button>
            <!-- <Button class="" text plain rounded aria-label="share" @click="handleShare">
                <template #icon> <ShareIcon /></template>
              </Button> -->
            <Button
              v-if="props.episodeData?.transcript"
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
            <Button
              v-if="isWagtail && commentCount > 0"
              plain
              rounded
              severity="secondary"
              :label="` ${String(commentCount)} ${
                commentCount === 1 ? 'comment' : 'comments'
              }`"
              class="comments-btn text-sm"
              aria-label="comments"
              @click="handleComments()"
            >
              <template #icon> <CommentsIcon class="w-1rem h-1rem" /></template>
            </Button>

            <DotMenu
              :menuItems="getDotMenuItems(props.episodeData)"
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
                      :src="theEpImage"
                      :alt="`${props.episodeData?.title} show image`"
                      :width="112"
                      :height="112"
                      class="show-image-in-menu flex-none"
                      :ratio="[1, 1]"
                      style="height: 60px; width: 60px"
                    />

                    <div class="info">
                      <h2>{{ props.episodeData?.title }}</h2>
                      <p>{{ props.episodeData?.showTitle }}</p>
                    </div>
                  </div>
                  <hr class="mt-5 mb-2 dim" />
                </div>
              </template>
            </DotMenu>
          </div>
        </div>
      </div>
      <div
        v-else-if="props.pending"
        class="flex flex-column gap-2 md:gap-3 col pr-2 lg:pr-4 mt-3 mb-6"
      >
        <Skeleton width="90%" borderRadius="16px" class="h-1rem md:h-3rem" />
        <Skeleton width="65%" borderRadius="16px" class="h-1rem md:h-3rem" />
        <div class="article-metadata">
          <div class="flex gap-2 align-items-center mb-1">
            <Skeleton
              height="12px"
              width="120px"
              borderRadius="16px"
              class="opacity-70"
            />
            <Skeleton height="8px" width="8px" borderRadius="50%" class="opacity-50" />
            <Skeleton height="12px" width="70px" borderRadius="16px" class="opacity-70" />
          </div>
        </div>
        <div class="button-holder flex align-items-center gap-3 flex-wrap">
          <Skeleton height="28px" width="140px" borderRadius="16px" class="z-2" />

          <slot>
            <div class="flex align-items-center gap-4">
              <Skeleton class="mr-2" height="25px" width="5px" borderRadius="16px" />
            </div>
          </slot>
        </div>
      </div>
      <div class="col-fixed hidden xl:block w-20rem"></div>
    </div>
    <div class="grid">
      <div class="col-fixed hidden xxl:block w-20rem"></div>
      <div class="col pr-2 lg:pr-4">
        <div v-if="!props.pending" class="episode-page-image-holder relative mb-4">
          <VImage
            :src="theEpImage"
            :size="{
              xs: [327, 218],
              sm: [528, 352],
              md: [672, 448],
              lg: [560, 373],
              xl: [933, 621],
              xxl: [688, 458],
            }"
            :maxHeight="props.episodeData?.imageFullHeight"
            :maxWidth="props.episodeData?.imageFullWidth"
            allowVerticalEffect
            :alt="props.episodeData?.image?.altText"
            class="episode-page-image mb-2"
          >
            <template #caption>
              <VImageCaption v-if="theEpImageCaption" :text="theEpImageCaption" />
            </template>
            <template #gallery>
              <VImageGallery
                v-if="gallery?.slides"
                :count="String(gallery?.slides.length)"
                :gallery-link="galleryLink"
              />
            </template>
            <template #belowImage>
              <div>
                <p class="text-right mt-1 type-fineprint">
                  {{ props.episodeData?.image.credit }}
                </p>
              </div>
            </template>
          </VImage>
        </div>
        <div v-if="props.pending" class="episode-page-image-holder relative mb-5">
          <Skeleton
            borderRadius="0px"
            class="episode-page-image mb-2 opacity-60 w-full h-auto"
          />
        </div>

        <v-streamfield
          v-if="props.episodeData?.body && !props.pending"
          class="my-5"
          :article="props.episodeData"
        />
        <div v-else-if="props.pending" class="my-5">
          <skeleton-text />
        </div>

        <!-- SEGMENTS -->
        <ol
          v-if="hasSegments && !props.pending"
          class="flex flex-column gap-3 mt-5 segment-list"
        >
          <li
            v-for="segment in props.episodeData?.audio"
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
        <div v-else-if="props.pending">
          <skeleton-media-card
            v-for="i in 10"
            :key="`sk1-${i}`"
            is-horizontal
            imgCol="w-7rem md:w-10rem"
            :size="[1, 1]"
            :showBg="false"
            :showBgMobile="false"
            showTease
            :showImage="!hasSegments"
            class="mb-5"
          />
        </div>
        <story-article-footer
          class="lg:hidden"
          :article="props.episodeData"
          :isDisableComments="props.episodeData?.cmsSource !== 'WAGTAIL'"
          :showAd="!props.show"
        />
      </div>
      <div class="col-fixed hidden lg:block w-20rem">
        <ShowSummary v-if="props.show" :show="props.show" />
        <story-article-footer
          :article="props.episodeData"
          :isDisableComments="props.episodeData?.cmsSource !== 'WAGTAIL'"
          :showAd="!props.show"
        />
      </div>
    </div>
  </section>
</template>

<style lang="scss">
.episode-template .comments-btn {
  .comments-icon {
    //margin-top: 3px;
  }
}
</style>
