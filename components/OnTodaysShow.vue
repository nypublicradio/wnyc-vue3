<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import VImageWithCaption from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageWithCaption.vue'
import {
  useCurrentStreamStation,
  useAllCurrentStations,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsEpisodePlaying,
} from '~/composables/states'
import { formatTime } from '~/utilities/helpers'
const currentStreamStation = useCurrentStreamStation()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const allCurrentStations = useAllCurrentStations()
const isEpisodePlaying = useIsEpisodePlaying()

//const emit = defineEmits(["change", "click"]);
watch(currentEpisodeHolder, (val) => {})
</script>

<template>
  <div class="on-todays-show">
    <!--  <pre>
        {{ currentEpisodeHolder }}
        </pre
    > -->

    <div class="grid grid-nogutter">
      <div class="col-12 md:col-6 overflow-hidden">
        <h2 class="font-bold font-meta inline">
          Today on {{ featuredData.title }}
        </h2>
        <span class="title-line relative w-full"></span>
        <!-- <div class="on-todays-show-time">
          {{ formatTime(showSchedule['iso-start-time']) }} -
          {{ formatTime(showSchedule['iso-end-time']) }}
        </div> -->
        <v-flexible-link raw :to="featuredData.headlineLink">
          <h2 v-html="featuredData.headline" />
        </v-flexible-link>
      </div>
      <div class="col-12 md:col-6">
        <!-- <v-image-with-caption
          loading="eager"
          :image="formatPublisherImageUrl(featuredImage.template)"
          :imageUrl="showData.featured.url"
          :width="700"
          :height="467"
          :alt-text="featuredImage['alt-text']"
          :maxWidth="featuredImage.w"
          :maxHeight="featuredImage.h"
          :credit="featuredImage['credits-name']"
          :credit-url="featuredImage['credits-url']"
          :caption="featuredImage.caption"
          :sizes="[1]"
          :ratio="[3, 2]"
        /> -->
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.on-todays-show {
  .title-line {
    &:after {
      content: '';
      position: absolute;
      margin-left: 20px;
      height: 2px;
      width: 100vw;
      top: 50%;
      background: rgba(map-get($colors, 'coolwhite'), 0.2);
    }
  }
}
</style>
