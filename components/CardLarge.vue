<script setup>
import {
  formatPublisherImageUrl,
  getMinutes,
  whenTime,
  trackClickEvent,
  copyToClipBoard,
} from '~/utilities/helpers'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
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
          copyToClipBoard(props.item.attributes['embed-code'])
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
            props.item.attributes['embed-code']
          )
        },
      },
    ],
  },
])

const togglePlay = (event) => {
  console.log(event)
}
</script>

<template>
  <div>
    <div class="card-large mb-4">
      <div class="top">
        <VImagePublisher
          :src="
            formatPublisherImageUrl(
              props.item.attributes['image-main'].template
            )
          "
          :width="248"
          :height="159"
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
            <template #left>{{ props.item.attributes['show-title'] }}</template>
            <template #right>
              <span class="nobreak">{{ whenTime(props.item.attributes) }}</span>
            </template>
          </PipeData>
        </div>
        <div class="flex justify-content-between align-items-center">
          <PlayButton
            :label="getMinutes(props.item.attributes['estimated-duration'], 1)"
            @onClick="togglePlay"
          />
          <DotMenu :items="menuItems" :data="props.item.attributes">
            <template #end>
              <div class="p-2 pb-0">
                <Textarea
                  class="w-full text-xs"
                  v-model="props.item.attributes['embed-code']"
                  rows="5"
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
