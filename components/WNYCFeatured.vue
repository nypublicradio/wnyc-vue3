<script async setup>
import {
  getMinutes,
  resizePublisherImage,
  trackClickEvent,
  copyToClipBoard,
} from '~/utilities/helpers'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'
import { useToast } from 'primevue/usetoast'
const toast = useToast()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

const props = defineProps({
  bucketItems: {
    type: Object,
    default: null,
  },
})

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: 'Download',
      title: bucketItem.attributes.title,
      command: () => {
        toast.add({
          severity: 'info',
          summary: 'Downloading...',
          detail: bucketItem.title,
          life: 3000,
        })
        trackClickEvent(
          'Click Tracking - Audio Download',
          'Large Card',
          bucketItem.attributes.title
        )
      },
    },
    {
      label: 'Copy embed code',
      title: bucketItem.attributes.title,
      embedCode: bucketItem.attributes.embedCode,
      command: () => {
        copyToClipBoard(bucketItem.attributes.embedCode)
          ? toast.add({
              severity: 'info',
              summary: 'Embed code copied to clipboard',
              life: 3000,
            })
          : toast.add({
              severity: 'error',
              summary: 'Copy to clipboard failed. Try again another time',
              life: 3000,
            })
        trackClickEvent(
          'Click Tracking - Audio Copy Embed Code',
          'Large Card',
          bucketItem.attributes.embedCode
        )
      },
    },
  ]
}

// fire the command located in tehe menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

// normalize the bucket item data for the player
const normalizedItem = (item) => {
  return {
    ...item,
    file: item.attributes.audio,
    title: item.attributes.title,
    image: resizePublisherImage(item.attributes, 150, 150, 80),
    duration: item.attributes.estimatedDuration,
    details: item.attributes.body,
    first_published_at: item.attributes.publishAt,
  }
}

// handle the play button click
const togglePlay = (item) => {
  if (currentEpisode.value?.id !== item.id) {
    currentEpisode.value = normalizedItem(item)
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent(
    'Click Tracking - Large Card',
    item.attributes.title,
    'toggle play'
  )
}
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature>
        <CardLarge
          v-if="bucketItems"
          v-for="item in bucketItems"
          :key="item.label"
          :item="item"
          style="min-width: 248px"
        >
          <template #play>
            <PlayButton
              :label="getMinutes(item.attributes.estimatedDuration, 1)"
              :file="item.attributes.audio"
              @onClick="togglePlay(item)"
              @click.prevent
            />
          </template>
          <template #menu>
            <DotMenu
              :menuItems="getDotMenuItems(item)"
              label="Options"
              @changeEmit="onMenuChange"
              @click.prevent
              class="-mr-1"
              size="large"
            >
              <template #end v-if="item.attributes.embedCode">
                <div class="p-0">
                  <Textarea
                    disabled
                    class="w-full text-xs mt-2"
                    v-model="item.attributes.embedCode"
                    rows="9"
                  />
                </div>
              </template>
            </DotMenu>
          </template>
        </CardLarge>

        <div v-else v-for="item in 5">
          <div class="skeleton-holder">
            <Skeleton
              class="flex-none"
              height="159px"
              width="100%"
              borderRadius="0px"
            />
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
                  <Skeleton
                    class=""
                    height="10.5px"
                    width="97%"
                    borderRadius="16px"
                  />
                  <Skeleton
                    class=""
                    height="10.5px"
                    width="95%"
                    borderRadius="16px"
                  />
                  <Skeleton
                    class=""
                    height="10.5px"
                    width="85%"
                    borderRadius="16px"
                  />
                  <Skeleton
                    class=""
                    height="10.5px"
                    width="100%"
                    borderRadius="16px"
                  />
                </div>
                <Skeleton
                  class="mt-2"
                  height="10px"
                  width="100%"
                  borderRadius="16px"
                />
              </div>
              <div class="flex justify-content-between">
                <Skeleton height="28px" width="84px" borderRadius="15px" />
                <Skeleton height="28px" width="10px" borderRadius="15px" />
              </div>
            </div>
          </div>
        </div>
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-featured {
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
