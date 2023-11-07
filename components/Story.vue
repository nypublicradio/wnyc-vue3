<script setup>
import VCard from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { cmsSources } from '~/composables/globals'
import { trackClickEvent, whenTime } from '~/utilities/helpers'
import { usePrimeVue } from 'primevue/config'

const props = defineProps({
  article: {
    type: Object,
    default: null,
  },
  index: {
    type: Number,
    default: null,
  },
})
//console.log(props.article)
// TEMP fix to make ripple work
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
</script>
<template>
  <div class="story-card">
    <VCard
      v-if="article"
      v-ripple
      class="p-ripple"
      :src="
        article.cmsSource === cmsSources.WAGTAIL
          ? String(article.image.id)
          : article.image?.template
      "
      :title="article.title"
      :loading="index > 1 ? 'lazy' : 'eager'"
      :maxWidth="
        article.cmsSource === cmsSources.WAGTAIL
          ? article.image.width
          : article.image.w
      "
      :maxHeight="
        article.cmsSource === cmsSources.WAGTAIL
          ? article.image.height
          : article.image.h
      "
      :sponsored="article.sponsoredContent"
      :width="116"
      :height="116"
      :ratio="[1, 1]"
      @click="
        navigateTo({
          path: `/story/${article.id}`,
          query: {
            src: article.cmsSource,
          },
        })
      "
      @title-click="
        trackClickEvent(
          'Click Tracking - Top Story',
          'Article Card Headline',
          $event
        )
      "
      @image-click="
        trackClickEvent(
          'Click Tracking - Top Story',
          'Article Card Image',
          $event
        )
      "
    >
      <template #belowBlurb>
        <div class="article-metadata pointer-events-none">
          <!--    <pre>{{ article.authors }}</pre> -->
          <PipeData
            :hidePipe="
              article.authors?.length == 0 || article.authors == undefined
            "
          >
            <template #left>
              <VByline prefix="" :authors="article.authors" isBlockLinks>
              </VByline>
            </template>
            <template #right>
              <span class="nobreak">{{ whenTime(article.meta) }}</span>
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
