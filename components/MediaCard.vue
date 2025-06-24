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
  goToEpisodePage,
  goToStoryPage,
  goToNprPage,
} from "~/utilities/helpers"
import {
  fetchAndStoreMp3,
  getDownloadedImageUri,
  playStoredMp3,
  isAlreadyDownloaded,
  /*   formatFileSize, */
} from "~/utilities/file-system"
import useSleepTimer from "~/composables/useSleepTimer"
import { cmsSources } from "~/composables/globals.ts"

const emit = defineEmits(["on-click", "on-delete-favorite"])

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  fallbackImage: {
    type: String,
    default: null,
  },
  imgSrc: {
    type: String,
    default: null,
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
  showImage: {
    type: Boolean,
    default: true,
  },
})
//const accountPromptSideBar = useAccountPromptSideBar()
const user = useCurrentUser()
const isNetworkConnected = useIsNetworkConnected()
const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()
//handle if it this is downloaded
const isDownloaded = ref(false)
// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isDownloaded.value = isAlreadyDownloaded(props.data)
  isFavorited.value = await checkIsFavorited(props.data?.meta?.slug)
})

const isPublisher = computed(() => {
  return props.data?.cmsSource === cmsSources.PUBLISHER
})
const isWagtail = computed(() => {
  return props.data?.cmsSource === cmsSources.WAGTAIL
})
const isNpr = computed(() => {
  return props.data?.cmsSource === cmsSources.NPR
})
const isSimplecast = computed(() => {
  return props.data?.cmsSource === cmsSources.SIMPLECAST
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
  if (hasAudio(bucketItem.audio)) {
    return [
      ...(!props.isSegment
        ? [
            {
              label: `${isFavorited.value ? "Unfavorite Episode" : "Favorite Episode"}`,
              customIcon: StarIcon,
              active: isFavorited.value,
              title: bucketItem.title,
              command: () => {
                handleAddToFavorites(bucketItem)
              },
            },
          ]
        : []),
      ...(hasAudio(bucketItem.audio) && !isDownloaded.value
        ? [
            {
              label: `Download ${
                bucketItem.segments && Array.isArray(bucketItem.audio) ? "All" : ""
              }`,
              //icon: 'pi pi-google',
              customIcon: DownloadIcon,
              title: bucketItem.title,
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
              title: bucketItem.title,
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
        title: bucketItem.title,
        command: () => {
          handleAddToFavorites(bucketItem)
        },
      },
      ...(props.showShare
        ? [
            {
              label: "Share",
              customIcon: ShareIcon,
              title: bucketItem.title,
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

const imgSrcUrl = ref("")

if (props.isInDownloads) {
  imgSrcUrl.value = await getDownloadedImageUri(props.data)
} else {
  imgSrcUrl.value = String(
    props.data?.image?.template ??
      props.data?.image?.id ??
      props.data?.image ??
      props.fallbackImage ??
      getEpisodeFallBackImage()
  )
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

// handle click event emit
const handleClick = () => {
  if (isNpr.value) {
    goToNprPage(props.data)
  } else if (isWagtail.value) {
    goToStoryPage(props.data, { src: props.data.cmsSource })
  } else if (isPublisher.value && hasAudio(props.data.audio)) {
    goToEpisodePage(props.data, { src: props.data.cmsSource, type: props.data.type })
  } else {
    goToStoryPage(props.data, { src: props.data.cmsSource })
  }
  emit("on-click")
}

// handle the play button render
const handleHasAudio = computed(() => {
  return (
    (props.showPlayButton && hasAudio(props.data.audio)) ||
    (props.showPlayButton && props.isSegment && hasAudio(props.data.url))
  )
})
</script>

<template>
  <div
    class="media-card"
    :style="`cursor: ${props.isSegment ? 'default !important' : ''}`"
  >
    <div
      v-if="!props.isSegment"
      v-ripple
      class="card-click w-full h-full absolute top-0 left-0 z-1 p-ripple"
      @click.prevent="handleClick"
      @keypress.enter.space="handleClick"
      tabindex="0"
      aria-role="button"
      :aria-label="`${props.data.showTitle} show details`"
    ></div>
    <div class="flex gap-3 w-full">
      <!-- <pre class="text-xs overflow-hidden">{{ props.data }}</pre> -->
      <VImage
        v-if="props.showImage"
        class="flex-none"
        :alt="`${props.data.showTitle} show `"
        :src="imgSrcUrl"
        :height="116"
        :width="116"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="height: 116px; width: 116px"
        tabindex="-1"
      />
      <div class="flex gap-2 flex-column justify-content-between w-full">
        <div class="flex gap-1 flex-column w-full">
          <div class="flex gap-0 flex-column align-items-start">
            <p v-if="props.showTitle" class="text-xs line-height-1">
              {{ props.data.org ?? props.data.showTitle }}
            </p>
            <h2 class="text-sm line-height-2 truncate t2lines no-hyphens">
              {{ props.data?.title }}
            </h2>
          </div>
          <div class="article-metadata">
            <PipeData class="text-xs">
              <template #left>
                {{
                  props.isSegment
                    ? props.data?.category
                    : props.data?.showTitle ||
                      props.data?.headers?.brand?.title ||
                      getOrg(props.data.cmsSource)
                }}
              </template>
              <template #right>
                {{ getDate(props.data) }}
              </template>
            </PipeData>

            <div class="text-xs mt-1 opacity-70">
              <VByline
                v-if="props.data.byline?.length > 0 && props.isSegment"
                :authors="props.data.byline"
                prefix="by "
              />
            </div>
          </div>
          <!-- FROM SUPABASE PROFILER DATA -->
          <!-- Has to have started playing to show -->
          <!-- <ProgressBar
          :value="50"
          style="height: 4px"
          class="w-full"
          :showValue="false"
          ></ProgressBar> -->
        </div>
        <div
          class="button-holder flex justify-content-between align-items-center flex-wrap"
        >
          <PlayButton
            v-if="handleHasAudio"
            :data="props.data"
            class="z-2"
            :label="getMinutes(props.data.estimatedDuration, 1)"
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
                class="z-1"
              >
                <template #header-bottom>
                  <div>
                    <div class="flex gap-3 align-items-center px-4">
                      <VImage
                        :src="imgSrcUrl"
                        :alt="`${props.data.showTitle} show image`"
                        class="show-image-in-menu flex-none"
                        :height="116"
                        :width="116"
                        :ratio="[1, 1]"
                        style="
                          height: 60px;
                          width: 60px;
                          background-color: var(--background);
                        "
                      />
                      <div class="info">
                        <h2 class="card-title-title">{{ props.data?.title }}</h2>
                        <p>{{ props.data.showTitle }}</p>
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
</template>

<style lang="scss" scoped>
.media-card {
  position: relative;
  cursor: pointer;
  .card-title-title {
    @include cardTitle();
  }
  .button-holder {
    margin-bottom: -6px;
  }
}
</style>
