<script setup>
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import TrashIcon from "~/components/icons/TrashIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import SleepIcon from "~/components/icons/SleepIcon.vue"
//import QueueIcon from "~/components/icons/QueueIcon.vue"
import { useIsNetworkConnected, useCurrentUser } from "~/composables/states"
import {
  checkIsFavorited,
  trackClickEvent,
  shareAPI,
  getMinutes,
  getDate,
  hasAudio,
  togglePlayEpisode,
  addToFavorites2,
  getEpisodeFallBackImage,
  handleDelete,
  getReadingTime,
  getOrg,
  formatTime,
  dynamicNavigation,
} from "~/utilities/helpers"
import {
  fetchAndStoreMp3,
  getDownloadedImageUri,
  playStoredMp3,
  isAlreadyDownloaded,
  /*   formatFileSize, */
} from "~/utilities/file-system"
import useSleepTimer from "~/composables/useSleepTimer"
import { mediaTypes } from "~/composables/globals.ts"
import { useImageDimensions } from "~/composables/useImageDimensions"

const emit = defineEmits(["on-click", "on-delete-favorite"])

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  fallbackImage: {
    type: String,
    default: null,
  },
  imgSrc: {
    type: String,
    default: null,
  },
  hideDate: {
    type: Boolean,
    default: false,
  },
  showTease: {
    type: Boolean,
    default: false,
  },
  showTitle: {
    type: Boolean,
    default: false,
  },
  showPlayButton: {
    type: Boolean,
    default: true,
  },
  showShare: {
    type: Boolean,
    default: true,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  isInDownloads: {
    type: Boolean,
    default: false,
  },
  isSegment: {
    type: Boolean,
    default: false,
  },
  showLive: {
    type: Boolean,
    default: false,
  },
  showImage: {
    type: Boolean,
    default: true,
  },
  isFeature: {
    type: Boolean,
    default: false,
  },
  isEvent: {
    type: Boolean,
    default: false,
  },
  isHorizontal: {
    type: Boolean,
    default: false,
  },
  isVertical: {
    type: Boolean,
    default: false,
  },
  showBg: {
    type: Boolean,
    default: true,
  },
  showBgMobile: {
    type: Boolean,
    default: false,
  },
  imgCol: {
    type: String,
    default: "md:h-auto md:w-12",
  },
  // Responsive image size configuration
  // Object format: { xs: [112,112], md: [600,400] } - different sizes per breakpoint
  // Array format: [3, 2] - converted to ratio-based default size for backward compatibility
  // Default: {} uses [300,200] default size with smart cascading
  size: {
    type: [Array, Object],
    default: () => ({ xs: [112, 112] }),
  },
  imgSrcset: {
    type: Array,
    default: [2],
  },
})
const user = useCurrentUser()
const isNetworkConnected = useIsNetworkConnected()
const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()

// Use the simplified image dimensions composable
const { width: imageWidth, height: imageHeight } = useImageDimensions({
  size: props.size,
})

// Computed ratio for VImage compatibility - derived from current dimensions
const imageRatio = computed(() => {
  return [imageWidth.value, imageHeight.value]
})

//handle if it this is downloaded
const isDownloaded = ref(false)
// check if item is already favorited
const isFavorited = ref(false)

// check if this is a LIVE item
const isLive = props.data?.type === mediaTypes.LIVE

// this will change once we know how the event date will be passed
const eventDate = ref(props.data?.publicationDate)

const reactiveData = toRef(props, "data")

const nativeImageHeight = computed(() => {
  //console.log("reactiveData.value.imageFullHeight", reactiveData.value.imageFullHeight)
  return reactiveData.value.imageFullHeight ?? 112
})
const nativeImageWidth = computed(() => {
  return reactiveData.value.imageFullWidth ?? 112
})

const getImage = computed(() => {
  if (props.isInDownloads) {
    return getDownloadedImageUri(reactiveData.value)
  } else {
    return String(
      reactiveData.value?.image?.template ??
        reactiveData.value?.image?.id ??
        reactiveData.value?.image ??
        props.fallbackImage ??
        getEpisodeFallBackImage()
    )
  }
})

watchEffect(async () => {
  if (!props.data) return
  isDownloaded.value = isAlreadyDownloaded(props.data)
  isFavorited.value = await checkIsFavorited(props.data?.meta?.slug || props.data?.slug)
  eventDate.value = props.data?.publicationDate
})

// add item to favorites
const handleAddToFavorites = (bucketItem) => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: bucketItem,
    isFavorited: isFavorited.value,
    callback: () => {
      emit("on-delete-favorite")
    },
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}

const progress = ref({})
// handle the download of the audio file request and feed the progress
const handleDownload = async (bucketItem) => {
  trackClickEvent("Click Tracking - Audio Download", "Episode Item", bucketItem.title)
  progress.value = await fetchAndStoreMp3(bucketItem)
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  if (hasAudio(bucketItem?.audio)) {
    return [
      ...(!props.isSegment
        ? [
            {
              label: `${isFavorited.value ? "Unfavorite Episode" : "Favorite Episode"}`,
              customIcon: StarIcon,
              active: isFavorited.value,
              title: bucketItem?.title,
              command: () => {
                handleAddToFavorites(bucketItem)
              },
            },
          ]
        : []),
      ...(hasAudio(bucketItem?.audio) && !isDownloaded.value
        ? [
            {
              label: `Download ${
                bucketItem?.segments && Array.isArray(bucketItem?.audio) ? "All" : ""
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
      ...(isDownloaded.value
        ? [
            {
              label: "Remove from Download",
              customIcon: TrashIcon,
              command: () => {
                handleDelete(bucketItem)
              },
            },
          ]
        : []),
      ...(props.showShare && !props.isSegment
        ? [
            {
              label: "Share",
              customIcon: ShareIcon,
              title: bucketItem?.title,
              command: () => {
                shareAPI(bucketItem, "Media Card")
              },
            },
          ]
        : []),
      {
        label: "Sleep Timer",
        customIcon: SleepIcon,
        active: sleepTimerRunning.value,
        title: "Sleep Timer",
        command: () => {
          handleSleepTimer()
        },
      },
    ]
  } else {
    return [
      {
        label: `${isFavorited.value ? "Unfavorite Story" : "Favorite Story"}`,
        customIcon: StarIcon,
        active: isFavorited.value,
        title: bucketItem?.title,
        command: () => {
          handleAddToFavorites(bucketItem)
        },
      },
      ...(props.showShare
        ? [
            {
              label: "Share",
              customIcon: ShareIcon,
              title: bucketItem?.title,
              command: () => {
                shareAPI(bucketItem, "Media Card")
              },
            },
          ]
        : []),
    ]
  }
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e?.value?.command()
}

// handle the playing of the stored audio file and GA tracking
const toggleDownloadedPlay = (file) => {
  playStoredMp3(file)
  // GA tracking
  trackClickEvent(
    "Click Tracking - Play download episode",
    "Episode Item",
    `playing = ${file.title}`
  )
}

// handle click event & emit
const handleClick = () => {
  dynamicNavigation(props.data)
  emit("on-click")
}

// handle the play button render
const handleHasAudio = computed(() => {
  return (
    (props.showPlayButton && hasAudio(props.data?.audio)) ||
    (props.showPlayButton && props.isSegment && hasAudio(props.data.url))
  )
})
</script>

<template>
  <div
    class="media-card"
    :style="`cursor: ${props.isSegment ? 'default !important' : ''}`"
    :class="[
      {
        'show-image': props.showImage,
        'show-bg': props.showBg,
        'show-bg-mobile': props.showBgMobile,
        'is-feature': props.isFeature,
        'is-horizontal': props.isHorizontal,
        'is-vertical': props.isVertical,
      },
      props.data?.type,
      props.data?.cmsSource,
      props.data?.mediaType,
    ]"
  >
    <div
      v-if="!props.isSegment"
      v-ripple
      class="card-click w-full h-full absolute top-0 left-0 z-1 p-ripple"
      @click.prevent="handleClick"
      @keypress.enter.space="handleClick"
      tabindex="0"
      aria-role="button"
      :aria-label="`${props.data?.showTitle} show details`"
    ></div>
    <div class="holder flex flex-nogutter">
      <div
        v-if="props.isEvent"
        class="event flex flex-column w-4rem h-4rem absolute top-0 left-0 z-2"
      >
        <p class="date day">{{ formatTime(eventDate, "d") }}</p>
        <p class="date month">{{ formatTime(eventDate, "MMM") }}</p>
      </div>
      <div
        class="image overflow-hidden p-0 col-fixed"
        :class="props.imgCol"
        v-if="props.showImage"
      >
        <VImage
          class="flex-none"
          :alt="`${props.data?.showTitle} show `"
          :src="getImage"
          :width="imageWidth"
          :height="imageHeight"
          :ratio="imageRatio"
          :maxHeight="nativeImageHeight"
          :maxWidth="nativeImageWidth"
          :srcset="props.imgSrcset"
          allowVerticalEffect
          tabindex="-1"
        />
      </div>
      <div class="content col">
        <div class="flex gap-2 flex-column justify-content-between w-full h-full">
          <div class="flex gap-1 flex-column w-full">
            <div class="flex gap-2 flex-column align-items-start">
              <LiveBadge v-if="props.showLive && !props.saved" class="align-self-start" />
              <p v-if="props.showTitle" class="text-xs line-height-1">
                {{ props.data?.org ?? props.data?.showTitle }}
              </p>
              <h2 class="truncate t2lines no-hyphens">{{ props.data?.title }}</h2>
            </div>
            <div class="article-metadata">
              <PipeData class="text-xs" :hidePipe="props.hideDate">
                <template #left>
                  {{
                    props.isSegment
                      ? props.data?.category
                      : props.data?.showTitle ||
                        props.data?.headers?.brand?.title ||
                        getOrg(props.data?.cmsSource)
                  }}
                </template>
                <template #right v-if="!props.hideDate">
                  {{ getDate(props.data) }}
                </template>
              </PipeData>

              <div class="text-xs mt-1 opacity-70">
                <VByline
                  v-if="props.data?.byline?.length > 0 && props.isSegment"
                  :authors="props.data?.byline"
                  prefix="by "
                />
              </div>
            </div>
            <HtmlConvert
              v-if="props.data.tease && props.showTease"
              :htmlContent="props.data.tease"
              class="tease"
            />
          </div>
          <div
            class="button-holder flex justify-content-between align-items-center flex-wrap"
          >
            <template v-if="!isLive">
              <PlayButton
                v-if="handleHasAudio"
                :data="props.data"
                class="z-2"
                :label="getMinutes(props.data?.estimatedDuration, 1)"
                @onClick="
                  isDownloaded && !isNetworkConnected
                    ? toggleDownloadedPlay(props.data)
                    : togglePlayEpisode(props.data)
                "
              >
              </PlayButton>
              <ReadButton
                v-else
                class="z-2"
                :label="props.data?.reading_time ?? getReadingTime(props.data?.rawBody)"
                :file="props.data?.name"
                @on-click="handleClick"
              />
            </template>
            <div v-else></div>
            <slot>
              <div class="flex gap-1 align-items-center">
                <DownloadProgress
                  class="mr-2"
                  v-if="(progress && Object.keys(progress).length > 0) || isDownloaded"
                  :isDownloaded="isDownloaded"
                  :progress="progress"
                  small
                />
                <BarsPlaying :data="props.data" />
                <DotMenu
                  v-if="!props.saved"
                  :menuItems="getDotMenuItems(props.data)"
                  label=""
                  @changeEmit="onMenuChange"
                  class="z-1 -mr-2"
                >
                  <template #header-bottom>
                    <div>
                      <div class="flex gap-3 align-items-center px-4">
                        <VImage
                          :src="getImage"
                          :alt="`${props.data?.showTitle} show image`"
                          class="show-image-in-menu flex-none"
                          :height="112"
                          :width="112"
                          :maxHeight="nativeImageHeight"
                          :maxWidth="nativeImageWidth"
                          allowVerticalEffect
                          :ratio="[1, 1]"
                          style="
                            height: 60px;
                            width: 60px;
                            background-color: var(--background);
                          "
                        />
                        <div class="info">
                          <h2 class="card-title-title">{{ props.data?.title }}</h2>
                          <p>{{ props.data?.showTitle }}</p>
                        </div>
                      </div>
                      <hr class="mt-5 mb-2 dim" />
                    </div>
                  </template>
                </DotMenu>
                <Button
                  v-else
                  text
                  plain
                  rounded
                  class="flex-none z-1"
                  aria-label="star"
                  @click="handleAddToFavorites(props.data)"
                >
                  <template #icon>
                    <StarIcon class="h-2rem" :active="isFavorited" />
                  </template>
                </Button>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.media-card {
  position: relative;
  cursor: pointer;
  height: auto;
  .holder {
    position: relative;
    overflow: hidden;
    height: 100%;
    .event {
      background-color: var(--p-surface-950);
      padding: 12px;
      .date {
        width: 100%;
        text-align: center;
      }
      .day {
        font-size: var(--font-size-10);
        line-height: var(--font-size-10);
        font-weight: 700;
        color: var(--p-surface-0);
      }
      .month {
        font-size: var(--font-size-3);
        line-height: var(--font-size-3);
        font-weight: 700;
        color: var(--p-surface-0);
      }
    }
    @include media("<md") {
      border-radius: 0;
    }
    flex-direction: column;
    @include media("<md") {
      flex-direction: row;
    }
    .content {
      height: auto;
      padding: 0 0 0 1rem;
      h2 {
        @include cardTitle();
      }
      .tease {
        @include cardBody();
      }
    }
    .image {
      @include media("<md") {
        width: 112px;
        height: 112px;
        flex: 0 0 auto;
      }
      @include media("<xs") {
        width: 80px;
        height: 80px;
      }
    }
  }

  &.show-bg {
    .holder {
      background-color: var(--p-surface-25);
      border-radius: var(--media-card-border-radius);
      .content {
        padding: 1rem !important;
      }
    }
    @include media("<md") {
      .holder {
        background-color: transparent;
        border-radius: 0;
        .content {
          padding: 0 0 0 1rem !important;
        }
      }
    }
  }
  &.show-bg-mobile {
    @include media("<md") {
      .holder {
        background-color: var(--p-surface-25);
        border-radius: var(--media-card-border-radius);
        .content {
          padding: 1rem !important;
        }
      }
    }
  }

  .button-holder {
    margin-bottom: -6px;
  }

  &.is-feature {
    .holder {
      border-radius: var(--media-card-border-radius);
    }
    .content h2 {
      font-size: var(--font-size-7);
      line-height: var(--font-size-9);
      @include t4lines();
    }
  }
  &.is-horizontal {
    @include media(">md") {
      .holder {
        flex-direction: row;
      }
    }
    @include media("<md") {
      .holder {
        .image {
          width: 112px !important;
          height: 112px !important;
          flex: 0 0 auto;
        }
      }
    }
  }
  &.is-horizontal.is-feature {
    .holder {
      flex-direction: row;
    }
    @include media("<md") {
      .holder {
        background-color: var(--p-surface-25);
        flex-direction: column;
        .image {
          width: 100% !important;
          height: auto !important;
          .v-image {
            left: 0;
          }
        }
        .content {
          padding: 1rem !important;
        }
      }
    }
    &.show-bg {
      border-radius: var(--media-card-border-radius);
    }
  }
  &.is-vertical {
    .image {
      width: 100% !important;
      height: auto !important;
      .v-image {
        left: 0;
      }
    }
    .holder {
      flex-direction: column;
      background-color: var(--p-surface-25);
      .content {
        padding: 1rem !important;
      }
    }
  }
  &:not(.show-image) {
    .holder {
      .content {
        padding: 0;
      }
    }
  }
}
</style>
