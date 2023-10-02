<script setup>
import VCard from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VCard.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import {
  trackClickEvent,
  whenTime,
} from '~/utilities/helpers'

// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

// get the navigation data from Aviary
const config = useRuntimeConfig()
const { data: pagedata } = await useFetch('/api/homepage')
const articles = pagedata.value.top_stories;
</script>

<template>
  <div v-if="articles" class="top-stories">
    <div v-for="(article, index) in articles" :key="index" class="mb-4">
      <!-- <pre>{{ article }}</pre> -->
      <VCard
        v-ripple
        class="p-ripple"
        :src="article.leadImage"
        :title="article.title"
        :loading="index > 1 ? 'lazy' : 'eager'"
        :link="article.link"
        :maxWidth="article.listingImage?.width"
        :maxHeight="article.listingImage?.height"
        :sponsored="article.sponsoredContent"
        :width="116"
        :height="116"
        :ratio="[1, 1]"
        @click="navigateTo(`/story/${article.meta.slug}`)"
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
          <div class="article-metadata">
            <PipeData>
              <template #left>
                <VByline
                  prefix=""
                  :authors="article.authors"
                  @name-click="
                    trackClickEvent(
                      'Click Tracking - Top Story',
                      'Article Card Author Name',
                      $event.url
                    )
                  "
                  @organization-click="
                    trackClickEvent(
                      'Click Tracking - Top Story',
                      'Article Card Author Organization',
                      $event.url
                    )
                  "
                >
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
