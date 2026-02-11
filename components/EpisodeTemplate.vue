<script setup>
import {
  useCurrentUser,
  useCurrentEpisode,
  useIsApp,
} from "~/composables/states"
import { cmsSources } from '~/composables/globals'
import { useBreakpoints } from "~/composables/useBreakpoints"
import { isAlreadyDownloaded, fetchAndStoreMp3 } from "~/utilities/file-system"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import DownloadSmallIcon from "~/components/icons/DownloadSmallIcon.vue"
import TranscriptIcon from "~/components/icons/TranscriptIcon.vue"
import TranscriptSmallIcon from "~/components/icons/TranscriptSmallIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import SleepIcon from "~/components/icons/SleepIcon.vue"
import MoreEpisodesIcon from "~/components/icons/MoreEpisodesIcon.vue"
import CommentsIcon from "~/components/icons/CommentsIcon.vue"
import { normalizeGalleryPage } from "~/composables/data/galleryPages"
import {
  useCommentCounts,
  useUpdateCommentCounts,
} from "~/composables/comments"
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
  showPending: {
    type: Boolean,
    default: false,
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

const cmsSource = computed(() => route.params.cmsSource || route.query.src || cmsSources.PUBLISHER)
const isWagtail = cmsSource.value === cmsSources.WAGTAIL
const storySource = computed(() =>
  isWagtail
    ? `Gothamist${
        props.episodeData?.section?.name
          ? ` - ${props.episodeData.section.name}`
          : ""
      }`
    : props.episodeData?.headers?.brand?.title || "WNYC"
)

const gallery = ref(null)
const galleryLength = ref(null)
const galleryLink = ref(null)

const mainContentRef = ref(null)
const mainContentHeight = ref(null)
const minMainContentHeight = 210

const commentCounts = ref(null)
watch(
  () => props.episodeData,
  async () => {
    useUpdateCommentCounts([props.episodeData])
    commentCounts.value = useCommentCounts()

    if (props.episodeData?.leadGallery) {
      gallery.value = await usePageById(
        props.episodeData?.leadGallery.gallery
      ).then(({ data }) => normalizeGalleryPage(data.value))

      galleryLength.value = gallery.value?.slides?.length ?? 0

      galleryLink.value = String(
        `photos/${props.episodeData?.leadGallery.gallery}?article=${props.episodeData?.id}&src=${cmsSource.value}`
      )
    }
  },
  { once: true }
)

onMounted(() => {
  //slight delay helps get the accurate height
  setTimeout(() => {
    // get height of main content
    const contentHeight = mainContentRef.value?.offsetHeight
    // if height is less than minMainContentHeight, set the content height to minMainContentHeight for desired spacing at bottom of page
    if (contentHeight < minMainContentHeight) {
      // set the content height to minMainContentHeight to trigger the bottom circulation to display
      mainContentHeight.value = minMainContentHeight
      mainContentRef.value.style.paddingBottom = `${
        minMainContentHeight - contentHeight
      }px`
    } else {
      mainContentHeight.value = contentHeight
    }
  }, 100)
})

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
  trackClickEvent(
    "Click Tracking - Audio Download",
    "EpisodeTemplate",
    epD.title
  )
  progress.value = await fetchAndStoreMp3(epD)
}

//handle the share of the episode
const handleShare = () => {
  shareAPI(props.episodeData, "EpisodeTemplate")
}

//handle the transcript of the episode
const handleTranscript = () => {
  if (route.params.cmsSource) {
    navigateTo(`./${route.params.slug}/transcript`)
  } else {
    // Fallback for old route structure
    navigateTo(
      `./${route.params.slug}/transcript?src=${route.query.src}&type=${route.query.type}`
    )
  }
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

// handle play toggle
const togglePlayHere = (epData) => {
  togglePlayEpisode(epData, props.episodeData?.type)
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

const theEpImage = computed(() => getEpisodeImage())

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
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
    ...(hasAudio(bucketItem?.audio)
      ? [
          {
            label: `Download ${
              bucketItem.segments && Array.isArray(bucketItem?.audio)
                ? "All"
                : ""
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
      label: `${isFavorited.value ? "Unfavorite Episode" : "Favorite Episode"}`,
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem?.title,
      command: () => {
        handleAddToFavorites(bucketItem)
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
    ...(theSlug.value
      ? [
          {
            label: "More episodes",
            customIcon: MoreEpisodesIcon,
            title: bucketItem?.title,
            command: () => {
              moreFromClick()
            },
          },
        ]
      : []),
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
// watch(
//   () => props.episodeData,
//   () => {
//     console.log("episodeData in EpisodeTemplate:", props.episodeData)
//   }
// )
</script>

<template>
  <section class="episode-template">
    <div class="grid">
      <div class="col-fixed hidden xxl:block w-20rem"></div>
      <div v-if="!props.pending" class="col pr-2 lg:pr-4">
        <div class="flex gap-3 mb-6">
          <VImage
            v-if="theEpImage"
            :src="theEpImage"
            :size="{
              xxs: [112, 112],
              sm: [192, 192],
            }"
            :allowVerticalEffect="false"
            :ratio="[1, 1]"
            :alt="props.episodeData?.image?.altText"
            class="episode-page-image flex-none w-7rem md:w-12rem"
          >
            <!-- <template #caption>
              <VImageCaption
                v-if="theEpImageCaption"
                :text="theEpImageCaption"
              />
            </template> -->
            <template #gallery>
              <VImageGallery
                v-if="gallery?.slides"
                :count="String(gallery?.slides.length)"
                :gallery-link="galleryLink"
              />
            </template>
            <!-- <template #belowImage>
              <div>
                <p class="text-right mt-1 type-fineprint">
                  {{ props.episodeData?.image.credit }}
                </p>
              </div>
            </template> -->
          </VImage>
          <div class="flex flex-column gap-2 md:gap-3">
            <h1
              class="text-xl md:text-4xl -mt-1 md:mt-0 line-height-1 md:line-height-2"
            >
              {{ props.episodeData?.title }}
            </h1>
            <div
              v-if="props.episodeData?.authors?.length > 0"
              class="npr-story-page-author opacity-70 text-sm"
            >
              <VByline :authors="props.episodeData?.authors" />
            </div>
            <!-- :hide-pipe="!!!props.episodeData?.showTitle" -->
            <PipeData class="text-sm">
              <template #left>{{
                props.episodeData?.showTitle || storySource
              }}</template>
              <template #right>
                <span class="nobreak inline-flex gap-1"
                  >{{ getDate(props.episodeData, "LLL d, yyyy") }}
                </span>
              </template>
            </PipeData>
            <div
              class="lg:pb-6 flex align-items-center justify-content-start flex-wrap gap-3"
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
              <div class="flex gap-2 md:gap-3 align-items-center">
                <!-- <Button
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
                  <template #icon>
                    <TranscriptSmallIcon class="w-1rem h-1rem"
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
                  <template #icon>
                    <DownloadSmallIcon class="w-1rem h-1rem"
                  /></template>
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
                  <template #icon>
                    <CommentsIcon class="w-1rem h-1rem"
                  /></template>
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
        </div>
      </div>
      <!-- v-else-if="props.pending" -->
      <div
        v-else-if="props.pending"
        class="flex gap-3 col pr-2 lg:pr-4 mt-1 mb-6"
      >
        <Skeleton
          width="100%"
          borderRadius="0px"
          class="h-7rem md:h-12rem w-7rem md:w-12rem flex-none"
        />
        <div class="flex flex-column gap-2 md:gap-3 w-full">
          <div class="flex flex-column gap-1">
            <Skeleton
              width="90%"
              borderRadius="16px"
              class="h-1rem md:h-2rem"
            />
            <Skeleton
              width="65%"
              borderRadius="16px"
              class="h-1rem md:h-2rem"
            />
          </div>
          <div class="article-metadata">
            <div class="flex gap-2 align-items-center mb-1">
              <Skeleton
                height="12px"
                width="120px"
                borderRadius="16px"
                class="opacity-70"
              />
              <Skeleton
                height="8px"
                width="8px"
                borderRadius="50%"
                class="opacity-50"
              />
              <Skeleton
                height="12px"
                width="70px"
                borderRadius="16px"
                class="opacity-70"
              />
            </div>
          </div>
          <div class="button-holder flex align-items-center gap-2 flex-wrap">
            <Skeleton
              height="33px"
              width="90px"
              borderRadius="16px"
              class="z-2"
            />
            <Skeleton
              height="33px"
              width="33px"
              borderRadius="16px"
              class="z-2"
            />
            <Skeleton
              height="33px"
              width="33px"
              borderRadius="16px"
              class="z-2"
            />

            <slot>
              <div class="flex align-items-center gap-4">
                <Skeleton
                  class="ml-2"
                  height="22px"
                  width="5px"
                  borderRadius="16px"
                />
              </div>
            </slot>
          </div>
        </div>
      </div>
      <div class="col-fixed hidden xl:block w-20rem"></div>
    </div>
    <div class="grid">
      <div class="col-fixed hidden xxl:block w-20rem"></div>
      <div class="col pr-2 lg:pr-4">
        <div ref="mainContentRef">
          <v-streamfield
            v-if="props.episodeData?.body && !props.pending"
            class="mb-5"
            :article="props.episodeData"
          />
          <div v-else-if="props.pending" class="mb-5">
            <skeleton-text />
          </div>

          <!-- SEGMENTS -->
          <ol
            v-if="hasSegments && !props.pending"
            class="flex flex-column gap-3 segment-list mt-0"
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
          <div v-else-if="hasSegments && props.pending">
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
        <div v-if="mainContentHeight" class="bottom-holder">
          <slot name="bottom" />
        </div>
      </div>
      <div class="col-fixed hidden lg:block w-20rem">
        <ShowSummary
          v-if="props.showPending || props.show"
          :show="props.show"
          class="mb-6"
        />
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
.episode-template .v-byline .flexible-link {
  color: var(--p-text-color) !important;
  text-decoration: none;
}
</style>
