<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
import { getMinutes, getDate } from "~/utilities/helpers"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import QueueIcon from "~/components/icons/QueueIcon.vue"
import { deleteFavorite, saveFavorite, checkIsFavorited } from "~/utilities/helpers"

const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

const emit = defineEmits(["onClick, onDeleteFavorite, onSaveFavorite"])

const props = defineProps({
  data: {
    type: Object,
    default: {},
  },
  fallbackImage: {
    type: String,
    default: "./logo.png",
  },
})

// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data?.attributes?.slug)
})

const handleAddToFavorites = async (bucketItem) => {
  const episode = {
    cms_source: "publisher", // BONO TO DO: is this right to hardcode this?
    id: props.data?.id,
    slug: props.data?.attributes?.slug,
  }
  if (isFavorited.value) {
    isFavorited.value = false
    await deleteFavorite(episode)
    emit("onDeleteFavorite")
  } else {
    isFavorited.value = true
    saveFavorite(episode, props.data?.type)
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
}
//console.log('ep = ', props.data)

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
        handleShare(bucketItem)
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
</script>

<template>
  <div class="episode-item flex justify-content-between align-items-center p-ripple">
    <div class="flex gap-3" @click.prevent="emit('onClick')" v-ripple>
      <VImage
        v-if="props.data?.attributes?.imageMain?.template"
        class="flex-none"
        :src="props.data?.attributes?.imageMain?.template"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="min-height: 72px; min-width: 72px"
      />
      <VImage
        v-else
        class="flex-none"
        :src="props.fallbackImage"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="min-height: 72px; min-width: 72px"
      />
      <div class="flex gap-1 flex-column align-items-start">
        <h2 class="text-sm line-height-2">{{ props.data.attributes.title }}</h2>
        <p>{{ props.data.attributes.org }}</p>
        <div class="article-metadata flex flex-column gap-1">
          <PipeData class="text-xs">
            <template #left>
              <p class="text-xs">
                {{ getMinutes(props.data.attributes.estimatedDuration, 1) }}
              </p>
            </template>
            <template #right>
              <div class="flex gap-2 align-items-center">
                <p class="text-xs">
                  {{ getDate(props.data.attributes.publishAt) }}
                </p>
                <!-- FROM SUPABASE PROFILER DATA -->
                <DownloadedSmallIcon v-if="props.data.attributes.downloaded" />
              </div>
            </template>
          </PipeData>
          <!-- FROM SUPABASE PROFILER DATA -->
          <ProgressBar :value="50" style="height: 4px" :showValue="false"></ProgressBar>
        </div>
      </div>
    </div>

    <DotMenu
      :menuItems="getDotMenuItems(props.data.attributes)"
      label=""
      @changeEmit="onMenuChange"
      class="-mr-2"
    >
      <template #header-bottom>
        <div>
          <div class="flex gap-3 px-4 align-items-center">
            <VImage
              :src="props.data?.attributes?.imageMain?.template || props.fallbackImage"
              :alt="`${props.data.attributes.showTitle} show image`"
              :width="60"
              :height="60"
              :sizes="[2]"
              class="show-image-in-menu flex-none"
              :ratio="[1, 1]"
              style="
                min-height: 60px;
                min-width: 60px;
                background-color: var(--background);
              "
            />

            <div class="info">
              <h2>{{ props.data.attributes.title }}</h2>
              <p>{{ props.data.attributes.showTitle }}</p>
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
