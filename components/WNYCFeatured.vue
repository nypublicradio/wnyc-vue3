<script async setup>
import {
  getMinutes,
  trackClickEvent,
  copyToClipBoard,
  saveRecentlyPlayed,
  prepForPlayer,
} from "~/utilities/helpers"
import { useTogglePlayTrigger, useCurrentEpisode } from "~/composables/states"
import { fetchAndStoreMp3, isAlreadyDownloaded } from "~/utilities/file-system"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

const props = defineProps({
  articles: {
    type: Object,
    default: null,
  },
})

const progress = ref({})
// handle the download of the audio file request and feed the progress
const handleDownload = async (bucketItem) => {
  trackClickEvent("Click Tracking - Audio Download", "Large Card", bucketItem.title)

  progress.value[bucketItem.id] = await fetchAndStoreMp3(bucketItem)
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Download",
      title: bucketItem.title,
      customIcon: DownloadIcon,
      command: () => {
        handleDownload(bucketItem)
      },
    },
    {
      label: "Copy embed code",
      title: bucketItem.title,
      icon: "pi pi-code",
      embedCode: bucketItem.embedCode,
      command: () => {
        copyToClipBoard(bucketItem.embedCode)
        trackClickEvent(
          "Click Tracking - Audio Copy Embed Code",
          "Large Card",
          bucketItem.embedCode
        )
      },
    },
  ]
}

// fire the command located in tehe menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

// handle the play button click
const togglePlayHere = (item) => {
  if (currentEpisode.value?.id !== item.id) {
    currentEpisode.value = prepForPlayer(item)
    saveRecentlyPlayed(item, mediaTypes.SEGMENT)
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
}
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <!-- <pre class="text-xs">{{ props.articles[0] }}</pre> -->
      <HorizontalScrollFeature>
        <CardLarge v-for="(item, index) in props.articles" :key="item.label" :item="item">
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
                v-if="progress[item.id] || isAlreadyDownloaded(item)"
                class="mr-2"
                :isDownloaded="isAlreadyDownloaded(item)"
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
        </CardLarge>

        <!-- <div v-for="(item, index) in 5" :key="`sk1-${index}`">
          <div class="skeleton-holder">
            <Skeleton class="flex-none" height="159px" width="100%" borderRadius="0px" />
            <div
              class="flex w-full h-full flex-column justify-content-between p-3 pb-4 gap-3 h-15rem"
            >
              <div class="flex flex-column gap-2">
                <div>
                  <Skeleton
                    height="12px"
                    width="95%"
                    borderRadius="16px"
                    style="margin-bottom: 4px; margin-top: 4px"
                  />
                  <Skeleton
                    height="12px"
                    width="70%"
                    borderRadius="16px"
                    style="margin-bottom: 6px"
                  />
                </div>
                <div class="flex flex-column gap-2">
                  <Skeleton class="" height="10.5px" width="97%" borderRadius="16px" />
                  <Skeleton class="" height="10.5px" width="95%" borderRadius="16px" />
                  <Skeleton class="" height="10.5px" width="85%" borderRadius="16px" />
                  <Skeleton class="" height="10.5px" width="100%" borderRadius="16px" />
                </div>
                <Skeleton class="mt-2" height="10px" width="100%" borderRadius="16px" />
              </div>
              <div class="flex justify-content-between">
                <Skeleton height="28px" width="84px" borderRadius="15px" />
                <Skeleton height="28px" width="10px" borderRadius="15px" />
              </div>
            </div>
          </div>
        </div> -->
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-featured {
  .card-large {
    min-width: 248px;
    &:first-child {
      @include media(">=md") {
        margin-left: calc(((100% - 768px) / 2) + 40px);
      }
    }
  }
  .skeleton-holder {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    max-width: 248px;
    min-width: 248px;
    background-color: var(--background2);
  }
}
</style>
