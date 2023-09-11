<script setup>
import {
  formatPublisherImageUrl,
  getMinutes,
  whenTime,
  trackClickEvent,
  copyToClipBoard,
  resizePublisherImage,
} from '~/utilities/helpers'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage'
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const toast = useToast()

const props = defineProps({
  item: {
    type: Object,
    default: null,
    required: true,
  },
})

const menuItems = ref([
  {
    label: 'Options',
    items: [
      {
        label: 'Download',
        icon: 'pi pi-download',
        command: () => {
          // TODO: file system download
          toast.add({
            severity: 'info',
            summary: 'Downloading...',
            detail: props.item.attributes.title,
            life: 3000,
          })
          trackClickEvent(
            'Click Tracking - Audio Download',
            `Large Card`,
            props.item.attributes.title
          )
        },
      },
      {
        label: 'Copy embed code',
        icon: 'pi pi-code',
        command: () => {
          copyToClipBoard(props.item.attributes.embedCode)
            ? toast.add({
                severity: 'info',
                summary: 'Copied',
                detail: 'Embed code copied to clipboard',
                life: 3000,
              })
            : toast.add({
                severity: 'error',
                summary: 'Copy to clipboard failed',
                detail: 'Try again another time',
                life: 3000,
              })
          trackClickEvent(
            'Click Tracking - Audio Copy Embed Code',
            `Large Card`,
            props.item.attributes.embedCode
          )
        },
      },
    ],
  },
])

const normalizedItem = computed(() => {
  return {
    ...props.item,
    file: props.item.attributes.audio,
    title: props.item.attributes.title,
    image: resizePublisherImage(
      props.item.attributes.imageMain.template,
      60,
      60,
      80
    ),
    duration: props.item.attributes.estimatedDuration,
    details: props.item.attributes.body,
    first_published_at: props.item.attributes.publishAt,
  }
})

// handles play button click that updates the currentEpisode if it is a different file and togglePlayTrigger states
const togglePlay = () => {
  console.log('normalizedItem - ', normalizedItem.value)
  //if (currentEpisode.value?.file !== normalizedItem.value.file) {
  currentEpisode.value = normalizedItem.value
  //}
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent(
    'Click Tracking - Large Card',
    props.item.attributes.title,
    'toggle play'
  )
}
</script>

<template>
  <div>
    <div class="card-large mb-4">
      <div class="top">
        <!-- <pre>{{ props.item }}</pre> -->
        <!-- <VImage
          :src="
            resizePublisherImage(
              formatPublisherImageUrl(props.item.attributes.imageMain.template),
              248,
              159,
              80
            )
          "
          :width="248"
          :height="159"
          :ratio="[248, 159]"
        /> -->
        <VImagePublisher
          :src="
            formatPublisherImageUrl(props.item.attributes.imageMain.template)
          "
          :width="248"
          :height="159"
          :ratio="[248, 159]"
        />
      </div>
      <div class="bottom flex flex-column gap-2 justify-content-between">
        <div class="flex flex-column gap-2">
          <div class="title text-sm font-bold font-meta line-height-2">
            {{ props.item.attributes.title }}
          </div>
          <div
            class="desc text-xs line-height-3"
            v-html="props.item.attributes.body"
          />
          <PipeData class="text-xs">
            <template #left>{{ props.item.attributes.showTitle }}</template>
            <template #right>
              <span class="nobreak">{{ whenTime(props.item.attributes) }}</span>
            </template>
          </PipeData>
        </div>
        <div class="flex justify-content-between align-items-center">
          <PlayButton
            :label="getMinutes(props.item.attributes.estimatedDuration, 1)"
            :episode="normalizedItem"
            @onClick="togglePlay"
          />
          <DotMenu :items="menuItems" :data="props.item.attributes">
            <template #end>
              <div class="p-2 pb-0">
                <Textarea
                  disabled
                  class="w-full text-xs"
                  v-model="props.item.attributes.embedCode"
                  rows="9"
                />
              </div>
            </template>
          </DotMenu>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card-large {
  display: flex;
  flex-direction: column;
  border-radius: 8px;
  overflow: hidden;
  max-width: 248px;
  background-color: var(--background2);
  .top {
  }
  .bottom {
    padding: 1rem;
    height: 100%;
    .title {
      @include truncate();
      @include t3lines();
    }
    .desc {
      @include truncate();
      @include t4lines();
    }
  }
}
</style>
