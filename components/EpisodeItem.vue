<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
import { getMinutes, getDate } from '~/utilities/helpers'
import StarIcon from '~/components/icons/StarIcon.vue'
import DownloadIcon from '~/components/icons/DownloadIcon.vue'
import ShareIcon from '~/components/icons/ShareIcon.vue'
import QueueIcon from '~/components/icons/QueueIcon.vue'

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(['onClick'])

const props = defineProps({
  show: {
    type: Object,
    default: {},
    required: true,
  },
})

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: 'Favorite Episode',
      customIcon: StarIcon,
      active: true,
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    {
      label: 'Download',
      //icon: 'pi pi-google',
      customIcon: DownloadIcon,
      title: bucketItem.title,
      command: () => {
        handleDownload(bucketItem)
      },
    },
    {
      label: 'Share',
      customIcon: ShareIcon,
      title: bucketItem.title,
      command: () => {
        handleShare(bucketItem)
      },
    },
    {
      label: 'Add to Queue',
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
</script>

<template>
  <div
    class="episode-item flex justify-content-between align-items-center p-ripple"
  >
    <div class="flex gap-3" @click.prevent="emit('onClick')" v-ripple>
      <VImage
        class="flex-none"
        :src="props.show.image"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
      />
      <div class="flex gap-1 flex-column align-items-start">
        <h2 class="text-sm line-height-2">{{ props.show.title }}</h2>
        <p>{{ props.show.org }}</p>
        <div class="article-metadata flex flex-column gap-1">
          <PipeData class="text-xs">
            <template #left>
              <p class="text-xs">{{ getMinutes(props.show.duration, 1) }}</p>
            </template>
            <template #right>
              <div class="flex gap-2 align-items-center">
                <p class="text-xs">
                  {{ getDate(props.show.date) }}
                </p>
                <DownloadedSmallIcon v-if="props.show.downloaded" />
              </div>
            </template>
          </PipeData>
          <ProgressBar
            :value="50"
            style="height: 4px"
            :showValue="false"
          ></ProgressBar>
        </div>
      </div>
    </div>

    <DotMenu
      :menuItems="getDotMenuItems(props.show)"
      label=""
      @changeEmit="onMenuChange"
    >
      <template #header-bottom>
        <div>
          <div class="flex gap-3 px-4 align-items-center">
            <VImage
              :src="props.show.image"
              :alt="`${props.show.title} show image`"
              :width="60"
              :height="60"
              :sizes="[2]"
              class="show-image-in-menu"
              :ratio="[1, 1]"
            />

            <div class="info">
              <h2>{{ props.show.title }}</h2>
              <p>{{ props.show.show }}</p>
            </div>
          </div>
          <hr class="mt-5 mb-2 dim" />
        </div>
      </template>
    </DotMenu>
  </div>
</template>

<style lang="scss" scoped>
.episode-item {
}
</style>
