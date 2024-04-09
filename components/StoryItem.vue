<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import StarIcon from "~/components/icons/StarIcon.vue"
//import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
//import QueueIcon from "~/components/icons/QueueIcon.vue"
import {
  checkIsFavorited,
  shareAPI,
  hasAudio,
  getReadingTime,
  whenTime,
  addToFavorites,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"
import { useCurrentUser } from "~/composables/states"
import { getDownloadedImageUri } from "~/utilities/file-system"
import { cmsSources } from "~/composables/globals"

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["on-click"])

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  fallbackImage: {
    type: String,
    default: "./logo.png",
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
    default: false,
  },
  saved: {
    type: Boolean,
    default: false,
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
})

const user = useCurrentUser()

// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data?.meta?.slug)
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
//   trackClickEvent("Click Tracking - Add to Queue", "Story Item", bucketItem.title)
// }

//const progress = ref({})
// handle the download of the audio file request and feed the progress
// const handleDownload = async (bucketItem) => {
//   trackClickEvent("Click Tracking - Audio Download", "Episode Item", bucketItem.title)
//   progress.value = await fetchAndStoreMp3(bucketItem)
// }

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Favorite Story",
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    // {
    //   label: `Download ${
    //     bucketItem.segments && Array.isArray(bucketItem.audio) ? "All" : ""
    //   }`,
    //   //icon: 'pi pi-google',
    //   customIcon: DownloadIcon,
    //   title: bucketItem.title,
    //   command: () => {
    //     handleDownload(bucketItem)
    //   },
    // },
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem.title,
      command: () => {
        shareAPI(bucketItem, "Episode Item")
      },
    },
    // {
    //   label: "Add to Queue",
    //   active: true,
    //   customIcon: QueueIcon,
    //   title: bucketItem.title,
    //   command: () => {
    //     handleAddToQueue(bucketItem)
    //   },
    // },
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

const imgSrcUrl = ref("")
if (props.isDownloaded) {
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

// handle click event emit
const handleClick = () => {
  emit("on-click")
  // navigateTo({
  //   path: `/story/${props.data.id ?? props.data.media_id}`,
  //   query: {
  //     src: props.data.cmsSource,
  //   },
  // })
}
</script>

<template>
  <div class="story-item relative p-ripple" v-ripple>
    <div
      class="card-click w-full h-full absolute top-0 left-0 z-1"
      @click.prevent="handleClick"
    ></div>
    <div v-if="imgSrcUrl" class="flex gap-3 w-full">
      <VImage
        class="flex-none"
        :src="imgSrcUrl"
        :height="116"
        :width="116"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="height: 116px; width: 116px"
      />
      <div class="flex gap-1 flex-column justify-content-between w-full">
        <div class="flex gap-1 flex-column w-full">
          <div class="flex gap-0 flex-column align-items-start">
            <p v-if="props.showTitle" class="text-xs line-height-1">
              {{ props.data.org ?? props.data.showTitle }}
            </p>
            <h2 class="text-sm line-height-2 truncate t2lines">{{ props.data.title }}</h2>
          </div>
          <div class="article-metadata">
            <PipeData class="text-xs" :hide-pipe="!hasAudio">
              <template #left>
                {{ props.data.cmsSource == cmsSources.WAGTAIL ? "Gothamist" : "WNYC" }}
              </template>
              <template #right>
                {{ whenTime(props.data.meta) }}
              </template>
            </PipeData>
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
        <div class="flex justify-content-between align-items-center flex-wrap">
          <ReadButton
            class="z-1"
            :label="props.data?.reading_time ?? getReadingTime(props.data?.rawBody)"
            :file="props.data?.name"
            @on-click="handleClick"
          />
          <slot>
            <DotMenu
              v-if="!props.saved"
              :menuItems="getDotMenuItems(props.data)"
              label=""
              @changeEmit="onMenuChange"
              class="z-1"
              height="28px"
              width="32px"
            >
              <template #header-bottom>
                <div>
                  <div class="flex gap-3 px-4 align-items-center">
                    <VImage
                      :src="imgSrcUrl"
                      :alt="`${props.data?.showTitle} show image`"
                      :width="116"
                      :height="116"
                      class="show-image-in-menu flex-none"
                      :ratio="[1, 1]"
                      style="
                        height: 60px;
                        width: 60px;
                        background-color: var(--background);
                      "
                    />
                    <div class="info">
                      <h2 class="card-title-title">{{ props.data.title }}</h2>
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
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.story-item {
  cursor: pointer;
  .card-title-title {
    @include cardTitle();
  }
}
</style>
