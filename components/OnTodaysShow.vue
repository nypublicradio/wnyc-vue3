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

const featuredData = ref({
  title: null,
  headline: null,
  headlineLink: null,
  episodeLink: null,
  hosts: null,
  image: null,
  imageAltText: null,
  imageCaption: null,
  imageCredits: null,
  imageCreditsUrl: null,
  segments: null,
  social: null,
  startTime: null,
  endTime: null,
})

//const emit = defineEmits(["change", "click"]);
watch(currentEpisodeHolder, (val) => {
  const episodeData = currentEpisodeHolder.value.included.find(
    (include) => include.type === 'episode'
  ).attributes

  const showData = currentEpisodeHolder.value.included.find(
    (include) => include.type === 'show'
  ).attributes
  const isEpisode = currentEpisodeHolder.value.included.find(
    (include) => include.type === 'episode'
  )
    ? true
    : false
  console.log('showData = ', showData)
  console.log('episodeData = ', episodeData)

  const showSchedule = currentEpisodeHolder.value.included.find(
    (include) => include.type === 'show-schedule'
  ).attributes

  // populate the featuredData object
  featuredData.value.title = isEpisode
    ? episodeData['show-title']
    : showData.title
  featuredData.value.headline = isEpisode
    ? episodeData.title
    : showData.featured.title
  featuredData.value.headline = isEpisode
    ? episodeData.title
    : showData.featured.url
  featuredData.value.startTime = formatTime(showSchedule['iso-start-time'])
  featuredData.value.endTime = formatTime(showSchedule['iso-end-time'])

  console.log('featuredData = ', featuredData.value)
})
</script>

<template>
  <div class="on-todays-show">
    <pre>
        {{ featuredData }}
        </pre
    >

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
