<script setup>
import VCard from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue"
import VByline from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue"
import { cmsSources } from "~/composables/globals"
import { trackClickEvent, whenTime } from "~/utilities/helpers"
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

const emit = defineEmits(["onClick"])

//console.log(props.article)
// TEMP fix to make ripple work
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
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

console.log("StoryItem =", props.data)
</script>
<template>
  <div class="story-card">
    <VCard
      v-if="props.data"
      v-ripple
      class="p-ripple"
      :src="
        props.data.cmsSource === cmsSources.WAGTAIL
          ? String(props.data.image.id)
          : props.data.image?.template
      "
      :title="props.data.title"
      :loading="index > 1 ? 'lazy' : 'eager'"
      :maxWidth="
        props.data.cmsSource === cmsSources.WAGTAIL
          ? props.data.image.width
          : props.data.image.w
      "
      :maxHeight="
        props.data.cmsSource === cmsSources.WAGTAIL
          ? props.data.image.height
          : props.data.image.h
      "
      :width="116"
      :height="116"
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
