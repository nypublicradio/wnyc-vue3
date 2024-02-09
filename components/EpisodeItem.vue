<script setup>
import { useToast } from "primevue/usetoast"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import QueueIcon from "~/components/icons/QueueIcon.vue"
import {
  deleteFavorite,
  saveFavorite,
  checkIsFavorited,
  getFavoritedItems,
  trackClickEvent,
  shareAPI,
  getMinutes,
  getDate,
  fetchDuration,
} from "~/utilities/helpers"
import { useCurrentUser, useAccountPromptSideBar } from "~/composables/states"
import {
  fetchAndStoreMp3,
  getDownloadedImageUri,
  isAlreadyDownloaded,
  /*   formatFileSize, */
} from "~/utilities/file-system"
import { FALLBACKIMAGELOCAL } from "~/composables/globals"
const toast = useToast()

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["on-click, onDeleteFavorite, onSaveFavorite"])

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
  saved: {
    type: Boolean,
    default: false,
  },
  isDownloaded: {
    type: Boolean,
    default: false,
  },
})
const accountPromptSideBar = useAccountPromptSideBar()
const user = useCurrentUser()

// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data?.meta.slug)
})

const estimatedDuration = ref(props.data.estimatedDuration)

watch(
  estimatedDuration,
  async () => {
    estimatedDuration.value =
      estimatedDuration.value === 0 || estimatedDuration.value === undefined
        ? await fetchDuration(props.data.audio)
        : estimatedDuration.value
  },
  { immediate: true }
)

const handleAddToFavorites = async (bucketItem) => {
  if (user.value) {
    const episode = {
      cmsSource: "publisher", // BONO TO DO: is this right to hardcode this?
      id: props.data?.id,
      slug: props.data?.meta.slug,
    }
    if (isFavorited.value) {
      await deleteFavorite(episode)
      getFavoritedItems()
      isFavorited.value = false
      emit("onDeleteFavorite")
    } else {
      await saveFavorite(episode, props.data?.type)
      getFavoritedItems()
      isFavorited.value = true
      emit("onSaveFavorite")
    }
    toast.add({
      severity: "info",
      summary: "Updated your favorites.",
      life: 3000,
    })
    trackClickEvent(
      "Click Tracking - Add/remove from favorites",
      "Episode Item",
      bucketItem.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}
let progress = ref(null)

const handleDownload = async (bucketItem) => {
  console.log("bucketItem  =  ", bucketItem)
  trackClickEvent("Click Tracking - Audio Download", "Episode Item", bucketItem.title)
  progress.value = await fetchAndStoreMp3(bucketItem)
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Favorite Episode",
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    {
      label: "Download",
      //icon: 'pi pi-google',
      customIcon: DownloadIcon,
      title: bucketItem.title,
      command: () => {
        handleDownload(bucketItem)
      },
    },
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem.title,
      command: () => {
        shareAPI(bucketItem, "Episode Item")
      },
    },
    {
      label: "Add to Queue",
      active: true,
      customIcon: QueueIcon,
      title: bucketItem.title,
      command: () => {
        handleAddToQueue(bucketItem)
      },
    },
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

const hasAudio = computed(() => {
  return (
    (props.data.audio && typeof props.data.audio === "string") ||
    (Array.isArray(props.data.audio) && props.data.audio.length === 0)
  )
})

const imgSrcUrl = ref("")
if (props.isDownloaded) {
  imgSrcUrl.value = await getDownloadedImageUri(props.data)
} else {
  imgSrcUrl.value =
    props.data?.image?.template ??
    props.data?.image ??
    props.fallbackImage ??
    FALLBACKIMAGELOCAL
}

const handleClick = () => {
  emit("on-click")
}
</script>

<template>
  <div class="episode-item flex justify-content-between align-items-center p-ripple">
    <div class="flex gap-3 w-full" @click.prevent="handleClick" v-ripple>
      <VImage
        class="flex-none"
        :src="imgSrcUrl"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="height: 72px; width: 72px"
      />
      <div class="flex gap-1 flex-column w-full">
        <div class="flex gap-0 flex-column align-items-start">
          <p v-if="props.showTitle" class="text-xs line-height-1">
            {{ props.data.org ?? props.data.showTitle }}
          </p>
          <h2 class="text-sm line-height-2 truncate t2lines">{{ props.data.title }}</h2>
        </div>
        <div class="article-metadata -mb-1">
          <PipeData class="text-xs" :hide-pipe="!hasAudio">
            <template #left>
              <span v-if="hasAudio">
                <p class="text-xs" v-if="estimatedDuration">
                  {{ getMinutes(estimatedDuration, 1) }}
                </p>
                <i v-else class="pi pi-spin pi-spinner" style="font-size: 0.75rem"></i>
              </span>
            </template>
            <template #right>
              <div class="flex gap-2 align-items-center">
                <p class="text-xs">
                  {{ getDate(props.data.updatedDate ?? props.data.publicationDate) }}
                </p>
                <!-- FROM CapacitorJS Preferences local storage -->
                <DownloadProgress
                  v-if="progress || isAlreadyDownloaded(props.data)"
                  :isDownloaded="isAlreadyDownloaded(props.data)"
                  :progress="progress"
                  small
                />
                <!-- <span> {{ formatFileSize(props.data.directoryAudio.size) }}</span> -->
              </div>
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
    </div>

    <slot>
      <DotMenu
        v-if="!props.saved"
        :menuItems="getDotMenuItems(props.data)"
        label=""
        @changeEmit="onMenuChange"
        class="-mr-2"
      >
        <template #header-bottom>
          <div>
            <div class="flex gap-3 px-4 align-items-center">
              <VImage
                :src="imgSrcUrl"
                :alt="`${props.data.showTitle} show image`"
                :width="60"
                :height="60"
                :sizes="[2]"
                class="show-image-in-menu flex-none"
                :ratio="[1, 1]"
                style="height: 60px; width: 60px; background-color: var(--background)"
              />
              <div class="info">
                <h2>{{ props.data.title }}</h2>
                <p>{{ props.data.showTitle }}</p>
              </div>
            </div>
            <hr class="mt-5 mb-2 dim" />
          </div>
        </template>
      </DotMenu>
      <Button v-else text plain rounded class="flex-none">
        <template #icon>
          <StarIcon
            class="h-2rem"
            :active="isFavorited"
            @click="handleAddToFavorites(bucketItem)"
          />
        </template>
      </Button>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
.episode-item {
  cursor: pointer;
}
</style>
