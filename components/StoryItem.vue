<script setup>
import { useToast } from "primevue/usetoast"
import VCard from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue"
import VByline from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue"
import { cmsSources, FALLBACKIMAGE } from "~/composables/globals"
import {
  trackClickEvent,
  whenTime,
  deleteFavorite,
  saveFavorite,
  getFavoritedItems,
  checkIsFavorited,
} from "~/utilities/helpers"

import { useAccountPromptSideBar } from "~/composables/states"

import { usePrimeVue } from "primevue/config"

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  index: {
    type: Number,
    default: null,
  },
  saved: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["onClick, onSaveFavorite, onDeleteFavorite"])

const toast = useToast()

const accountPromptSideBar = useAccountPromptSideBar()
//console.log("data = ", props.data)
// TEMP fix to make ripple work
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})

// check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(props.data?.slug)
})

const onCardClick = () => {
  emit("onClick")
  navigateTo({
    path: `/story/${props.data.id || props.data.media_id}`,
    query: {
      src: props.data.cmsSource,
    },
  })
}

const handleAddToFavorites = async () => {
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
      "Story Item",
      props.data?.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}

//console.log("StoryItem =", props.data)
</script>
<template>
  <div class="story-card flex">
    <VCard
      v-if="props.data"
      v-ripple
      class="p-ripple w-full"
      :src="
        props.data.image
          ? props.data.cmsSource === cmsSources.WAGTAIL
            ? String(props.data.image.id)
            : props.data.image?.template ?? props.data.image
          : FALLBACKIMAGE
      "
      :title="props.data.title"
      :loading="index > 1 ? 'lazy' : 'eager'"
      :maxWidth="
        props.data.cmsSource === cmsSources.WAGTAIL
          ? props.data.image?.width
          : props.data.image?.w
      "
      :maxHeight="
        props.data.cmsSource === cmsSources.WAGTAIL
          ? props.data.image?.height
          : props.data.image?.h
      "
      :width="props.saved ? 72 : 116"
      :height="props.saved ? 72 : 116"
      :ratio="[1, 1]"
      @click.prevent="onCardClick"
      @title-click="
        trackClickEvent('Click Tracking - Top Story', 'Article Card Headline', $event)
      "
      @image-click="
        trackClickEvent('Click Tracking - Top Story', 'Article Card Image', $event)
      "
    >
      <template #belowBlurb>
        <div class="article-metadata pointer-events-none">
          <!--    <pre>{{ props.data.authors }}</pre> -->
          <PipeData
            :hidePipe="props.data.authors?.length == 0 || props.data.authors == undefined"
          >
            <template #left>
              <VByline prefix="" :authors="props.data.authors" isBlockLinks> </VByline>
            </template>
            <template #right>
              <span class="nobreak">{{ whenTime(props.data.meta) }}</span>
            </template>
          </PipeData>
        </div>
      </template>
    </VCard>
    <Button v-if="saved" text plain rounded class="flex-none">
      <template #icon>
        <StarIcon class="h-2rem" :active="isFavorited" @click="handleAddToFavorites" />
      </template>
    </Button>
  </div>
</template>

<style lang="scss">
.story-card {
  .v-card {
    cursor: pointer;
    .card-details {
      flex: 1;
      align-self: stretch !important;
      justify-content: space-between;
    }
    .card-title-title {
      font-size: 0.906rem;
      line-height: 1.25rem;
      font-weight: 700;
      @include truncate();
      @include t4lines();
    }
    .slot-below-blurb {
      font-size: 0.813rem;
      font-weight: 400;
      .flexible-link {
        color: inherit;
        text-decoration: none;
      }
      .v-byline {
        gap: 0;
      }
    }
  }
}
</style>
