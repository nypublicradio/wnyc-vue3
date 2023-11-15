<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue";
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config";
import { getMinutes, getDate } from "~/utilities/helpers";
import StarIcon from "~/components/icons/StarIcon.vue";
import DownloadIcon from "~/components/icons/DownloadIcon.vue";
import ShareIcon from "~/components/icons/ShareIcon.vue";
import QueueIcon from "~/components/icons/QueueIcon.vue";
import { deleteFavorite, saveFavorite, checkIsFavorited } from "~/utilities/helpers";

const $primevue = usePrimeVue();
defineExpose({
  $primevue,
});

const emit = defineEmits(["onClick"]);

const props = defineProps({
  ep: {
    type: Object,
    default: {},
    required: true,
  },
  fallbackImage: {
    type: String,
    default: "./logo.png",
  },
});

// if user is logged in, check if item is already favorited
const isFavorited = ref(await checkIsFavorited(props.ep?.attributes?.slug));

const handleAddToFavorites = (bucketItem) => {
  const episode = {
    cms_source: "publisher", // BONO TO DO: is this right to hardcode this?
    id: props.ep?.id,
    slug: props.ep?.attributes?.slug,
  };
  if (isFavorited.value) {
    deleteFavorite(episode);
    isFavorited.value = false;
  } else {
    saveFavorite(episode, props.ep?.type);
    isFavorited.value = true;
  }
  toast.add({
    severity: "info",
    summary: "Updated your favorites.",
    life: 3000,
  });
  trackClickEvent(
    "Click Tracking - Add/remove from favorites",
    "Episode Item",
    bucketItem.title
  );
};
//console.log('ep = ', props.ep)

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Favorite Episode",
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites(bucketItem);
      },
    },
    {
      label: "Download",
      //icon: 'pi pi-google',
      customIcon: DownloadIcon,
      title: bucketItem.title,
      command: () => {
        handleDownload(bucketItem);
      },
    },
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem.title,
      command: () => {
        handleShare(bucketItem);
      },
    },
    {
      label: "Add to Queue",
      active: true,
      customIcon: QueueIcon,
      title: bucketItem.title,
      command: () => {
        handleAddToQueue(bucketItem);
      },
    },
  ];
};

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command();
};
</script>

<template>
  <div class="episode-item flex justify-content-between align-items-center p-ripple">
    <div class="flex gap-3" @click.prevent="emit('onClick')" v-ripple>
      <VImage
        v-if="props.ep?.attributes?.imageMain?.template"
        class="flex-none"
        :src="props.ep?.attributes?.imageMain?.template"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="min-height: 72px; min-width: 72px; background-color: var(--background2)"
      />
      <VImage
        v-else
        class="flex-none"
        :src="props.fallbackImage"
        :height="72"
        :width="72"
        :ratio="[1, 1]"
        :srcset="[2]"
        style="min-height: 72px; min-width: 72px; background-color: var(--background2)"
      />
      <div class="flex gap-1 flex-column align-items-start">
        <h2 class="text-sm line-height-2">{{ props.ep.attributes.title }}</h2>
        <p>{{ props.ep.attributes.org }}</p>
        <div class="article-metadata flex flex-column gap-1">
          <PipeData class="text-xs">
            <template #left>
              <p class="text-xs">
                {{ getMinutes(props.ep.attributes.estimatedDuration, 1) }}
              </p>
            </template>
            <template #right>
              <div class="flex gap-2 align-items-center">
                <p class="text-xs">
                  {{ getDate(props.ep.attributes.publishAt) }}
                </p>
                <!-- FROM SUPABASE PROFILER DATA -->
                <DownloadedSmallIcon v-if="props.ep.attributes.downloaded" />
              </div>
            </template>
          </PipeData>
          <!-- FROM SUPABASE PROFILER DATA -->
          <ProgressBar :value="50" style="height: 4px" :showValue="false"></ProgressBar>
        </div>
      </div>
    </div>

    <DotMenu
      :menuItems="getDotMenuItems(props.ep.attributes)"
      label=""
      @changeEmit="onMenuChange"
      class="-mr-2"
    >
      <template #header-bottom>
        <div>
          <div class="flex gap-3 px-4 align-items-center">
            <VImage
              :src="props.ep?.attributes?.imageMain?.template || props.fallbackImage"
              :alt="`${props.ep.attributes.showTitle} show image`"
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
              <h2>{{ props.ep.attributes.title }}</h2>
              <p>{{ props.ep.attributes.showTitle }}</p>
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
