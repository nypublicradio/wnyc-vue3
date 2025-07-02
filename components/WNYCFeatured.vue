<script async setup>
import {
  getMinutes,
  trackClickEvent,
  shareAPI,
  checkIsFavorited,
  addToFavorites2,
  handleDelete,
  togglePlayEpisode,
} from "~/utilities/helpers"
import { useCurrentUser } from "~/composables/states"
import { fetchAndStoreMp3, isAlreadyDownloaded } from "~/utilities/file-system"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import TrashIcon from "~/components/icons/TrashIcon.vue"
const user = useCurrentUser()
const props = defineProps({
  articles: {
    type: Object,
    default: null,
  },
})

const progress = ref({})
const isFavorited = ref({})
const isDownloaded = ref({})
watchEffect(() => {
  props.articles.forEach(async (bucketItem) => {
    isDownloaded.value[bucketItem.id] = isAlreadyDownloaded(bucketItem)
    isFavorited.value[bucketItem.id] = await checkIsFavorited(
      bucketItem.meta.slug ?? bucketItem.slug
    )
  })
})

// handle the download of the audio file request and feed the progress
const handleDownload = async (bucketItem) => {
  trackClickEvent("Click Tracking - Audio Download", "Large Card", bucketItem.title)

  progress.value[bucketItem.id] = await fetchAndStoreMp3(bucketItem)
}

// add item to favorites
const handleAddToFavorites = (bucketItem) => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: bucketItem,
    isFavorited: isFavorited.value[bucketItem.id],
  })
  if (user.value) {
    isFavorited.value[bucketItem.id] = !isFavorited.value[bucketItem.id]
  }
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: `${
        isFavorited.value[bucketItem.id] ? "Unfavorite Episode" : "Favorite Episode"
      }`,
      customIcon: StarIcon,
      active: isFavorited.value[bucketItem.id],
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    ...(!isDownloaded.value[bucketItem.id]
      ? [
          {
            label: "Download",
            title: bucketItem.title,
            customIcon: DownloadIcon,
            command: () => {
              handleDownload(bucketItem)
            },
          },
        ]
      : []),
    ...(isDownloaded.value[bucketItem.id]
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
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem.title,
      command: () => {
        shareAPI(bucketItem, "Episode Item")
      },
    },
    // {
    //   label: "Copy embed code",
    //   title: bucketItem.title,
    //   icon: "pi pi-code",
    //   embedCode: bucketItem.embedCode,
    //   command: () => {
    //     copyToClipBoard(bucketItem.embedCode)
    //     trackClickEvent(
    //       "Click Tracking - Audio Copy Embed Code",
    //       "Large Card",
    //       bucketItem.embedCode
    //     )
    //   },
    // },
  ]
}

// fire the command located in tehe menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e?.value?.command()
}

// handle the play button click
const togglePlayHere = (item) => {
  togglePlayEpisode(item)
}
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature :data="props.articles">
        <template #default>
          <MediaCard
            v-for="(item, index) in props.articles"
            :data="item"
            :key="`home2-${item.label}`"
            is-vertical
            :size="[3, 2]"
            :showBg="true"
            :showBgMobile="true"
            :hideDate="true"
            :showTease="true"
            class="item btn"
          />

          <!-- <CardLarge
            v-for="(item, index) in props.articles"
            :key="item.label"
            :item="item"
            :hide-date="true"
            class="large-card item btn"
          >
            <template #play>
              <PlayButton
                v-if="item.audio"
                :label="getMinutes(item.estimatedDuration, 1)"
                :data="item"
                @onClick="togglePlayHere(item)"
                class="z-2"
              />
            </template>
            <template #menu>
              <div class="flex align-items-center">
                <DownloadProgress
                  v-if="progress[item.id] || isDownloaded[item.id]"
                  class="mr-2"
                  :isDownloaded="isDownloaded[item.id]"
                  :progress="progress[item.id]"
                />
                <BarsPlaying :data="item" />
                <DotMenu
                  v-if="item.audio"
                  :menuItems="getDotMenuItems(item)"
                  label="Options"
                  @changeEmit="onMenuChange"
                  class="-mr-1 z-2"
                >
                  <template #end v-if="item.embedCode">
                    <div class="p-0">
                      <Textarea
                        disabled
                        class="w-full text-xs mt-2"
                        v-model="item.embedCode"
                        rows="9"
                      />
                    </div>
                  </template>
                </DotMenu>
              </div>
            </template>
          </CardLarge> -->
        </template>
        <template #skeleton>
          <div class="flex w-full">
            <div v-for="i in 5" class="item" :key="`${i}-skeleton`">
              <skeleton-large-card class="btn" />
            </div>
          </div>
        </template>
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item {
  min-width: 248px;
  max-width: 248px;
}
</style>
