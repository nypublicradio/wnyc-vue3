<script setup>
import VCard from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { cmsSources } from '~/composables/globals'
import { trackClickEvent, whenTime } from '~/utilities/helpers'

const props = defineProps({
  articles: {
    type: Array,
    default: null,
  },
})

// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
</script>

<template>
  <div v-if="articles" class="top-stories">
    <div v-for="(article, index) in articles" :key="article.id" class="mb-4">
      <!-- <pre class="text-xs">{{ article }}</pre> -->
      <VCard
        v-ripple
        class="p-ripple"
        :src="
          article.cmsSource === cmsSources.WAGTAIL
            ? article.leadImage
            : article.image?.template
        "
        :title="article.title"
        :loading="index > 1 ? 'lazy' : 'eager'"
        :maxWidth="article.leadImageMaxWidth"
        :maxHeight="article.leadImageMaxHeight"
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
  </div>
  <div v-else>
    <div
      class="skeleton-holder flex gap-3 mb-4"
      v-for="(article, index) in 3"
      :key="`skeleton-${index}`"
    >
      <Skeleton
        class="flex-none"
        height="116px"
        width="116px"
        borderRadius="0px"
      />
      <div class="flex w-full flex-column justify-content-between py-1">
        <div>
          <Skeleton
            height="12px"
            width="85%"
            borderRadius="16px"
            style="margin-bottom: 6px"
          />
          <Skeleton
            height="12px"
            width="70%"
            borderRadius="16px"
            style="margin-bottom: 6px"
          />
        </div>
        <Skeleton
          class="opacity-50"
          height="12px"
          width="60%"
          borderRadius="16px"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.top-stories {
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
