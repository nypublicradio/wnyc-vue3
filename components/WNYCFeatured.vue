<script async setup>
import { ref } from 'vue'
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
const bucket = await usePublisherFetch('/buckets/wnyc-home-middle/')
const bucketItems = bucket?.data?.value?.data?.attributes?.bucketItems

const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: '',
      items: [
        {
          label: 'Download',
          icon: '',
          command: () => {
            // TODO: file system download
            alert(bucketItem.attributes.title)
            toast.add({
              severity: 'info',
              summary: 'Downloading...',
              detail: bucketItem.attributes.title,
              life: 3000,
            })
            trackClickEvent(
              'Click Tracking - Audio Download',
              `Large Card`,
              bucketItem.attributes.title
            )
          },
        },
        {
          label: 'Copy embed code',
          icon: '',
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
              `Large Card`,
              bucketItem.attributes.embedCode
            )
          },
        },
      ],
    },
  ]
}

const normalizedItem = (item) => {
  return {
    ...item,
    file: item.attributes.audio,
    title: item.attributes.title,
    image: resizePublisherImage(item.attributes.imageMain.template, 60, 60, 80),
    duration: item.attributes.estimatedDuration,
    details: item.attributes.body,
    first_published_at: item.attributes.publishAt,
  }
}

const togglePlay = (item) => {
  currentEpisode.value = normalizedItem(item)
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
          v-for="item in bucketItems"
          :item="item"
          style="min-width: 248px"
        >
          <template #play>
            <PlayButton
              :label="getMinutes(item.attributes.estimatedDuration, 1)"
              :episode="normalizedItem(item)"
              @onClick="togglePlay(item)"
            />
          </template>
          <template #menu>
            <DotMenu :menuItems="getDotMenuItems(item)" label="Options">
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
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-featured {
}
</style>
