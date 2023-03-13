<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import VImageWithCaption from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageWithCaption.vue'
import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'

import { resizePublisherImage } from '~/utilities/helpers'
import {
  useCurrentStreamStation,
  useAllCurrentStations,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsEpisodePlaying,
} from '~/composables/states'

const currentStreamStation = useCurrentStreamStation()
const currentEpisode = useCurrentEpisode()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const allCurrentStations = useAllCurrentStations()
const isEpisodePlaying = useIsEpisodePlaying()

const hosts = computed(() => currentEpisodeHolder?.value?.onTodaysShowHosts)
const social = computed(() => currentEpisodeHolder?.value?.onTodaysShowSocial)
const segments = computed(
  () => currentEpisodeHolder?.value?.onTodaysShowSegments
)

console.log('currentEpisodeHolder = ', currentEpisodeHolder)
const segmentsToShow = ref(3)

const showMoreSegments = () => {
  segmentsToShow.value = segments.value.length
  this.gaEvent('Non-Player', 'Segment List', 'Show More')
}

const gaEvent = () => {
  // place holder for GA event
}
</script>

<template>
  <div class="on-todays-show mt-7" v-if="currentEpisodeHolder">
    <div
      v-if="currentEpisodeHolder?.onTodaysShowHeadline"
      class="flex gap-5 flex-column md:flex-row"
    >
      <div class="overflow-hidden -mt-3 flex-1">
        <h2 class="font-bold font-meta inline">
          Today on {{ currentEpisodeHolder?.title }}
        </h2>
        <span class="title-line relative w-full"></span>
        <!-- <div class="on-todays-show-time">
          {{ formatTime(showSchedule['iso-start-time']) }} -
          {{ formatTime(showSchedule['iso-end-time']) }}
        </div> -->
        <v-flexible-link
          raw
          :to="currentEpisodeHolder?.onTodaysShowHeadlineLink"
        >
          <h2
            class="text-2xl md:text-3xl lg:text-4xl"
            v-html="currentEpisodeHolder?.onTodaysShowHeadline"
          />
        </v-flexible-link>
        <template v-if="segments">
          <segment-list class="mt-6">
            <segment-list-item
              v-for="(segment, index) in segments.slice(0, segmentsToShow)"
              :key="index"
              :title="segment.title"
              :url="segment.url"
              :new-window="segment.newWindow"
              @componentEvent="
                gaEvent('Non-Player', 'Segment List', ...arguments)
              "
            />
            <Button
              v-if="segments.length > segmentsToShow"
              class="show-more-btn mt-3 mx-auto"
              label="show more"
              @click="showMoreSegments"
            />
          </segment-list>
        </template>
      </div>
      <div class="flex-1 relative">
        <div class="dots"></div>
        <v-image-with-caption
          class="show-image"
          v-if="currentEpisodeHolder?.onTodaysShowImageTemplate"
          loading="eager"
          :image="currentEpisodeHolder?.onTodaysShowImageTemplate"
          :imageUrl="currentEpisodeHolder?.onTodaysShowImageCreditsUrl"
          :width="584"
          :height="360"
          :alt-text="currentEpisodeHolder?.onTodaysShowImageAltText"
          :maxWidth="currentEpisodeHolder?.onTodaysShowImageMaxWidth"
          :maxHeight="currentEpisodeHolder?.onTodaysShowImageMaxHeight"
          :credit="currentEpisodeHolder?.onTodaysShowImageCredits"
          :credit-url="currentEpisodeHolder?.onTodaysShowImageCreditsUrl"
          :caption="currentEpisodeHolder?.onTodaysShowImageCaption"
          :sizes="[1]"
          :ratio="[3, 2]"
        />
      </div>
    </div>
    <template v-if="hosts || social">
      <div
        class="on-todays-show-person-social-wrapper grid mt-7 align-items-center"
      >
        <div
          v-if="hosts"
          class="on-todays-show-person-list col-12 md:col-6 flex flex-wrap column-gap-6 xl:column-gap-7 row-gap-4"
        >
          <div
            v-for="(host, index) in hosts"
            :key="index"
            class="on-todays-show-person-item"
          >
            <v-flexible-link
              target="_blank"
              class="on-todays-show-person-link"
              :to="'https://www.wnyc.org' + host.url"
              raw
            >
              <HostCard
                class="on-todays-show-person"
                role="host"
                :name="host['first-name'] + ' ' + host['last-name']"
                :image="
                  host.image
                    ? resizePublisherImage(host.image, 170, 170)
                    : 'https://media.wnyc.org/i/raw/2021/01/radio_avatar.png'
                "
              />
            </v-flexible-link>
          </div>
        </div>
        <div class="connect relative col-12 md:col-6 pl-4 my-6 md:my-0">
          <p>Connect with the show!</p>
          <v-share-tools
            v-if="social.twitter || social.instagram || social.facebook"
            class="on-todays-show-social"
          >
            <v-share-tools-item
              v-if="social.twitter"
              :username="social.twitter"
              service="twitter"
              @click="gaEvent('Non-Player', 'Social Follow', ...arguments)"
            />
            <v-share-tools-item
              v-if="social.instagram"
              :username="social.instagram"
              service="instagram"
              @click="gaEvent('Non-Player', 'Social Follow', ...arguments)"
            />
            <v-share-tools-item
              v-if="social.facebook"
              :username="social.facebook"
              service="facebook"
              @click="gaEvent('Non-Player', 'Social Follow', ...arguments)"
            />
          </v-share-tools>
        </div>
      </div>
    </template>
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
  .show-more-btn {
    max-width: 200px;
  }
  .dots {
    position: absolute;
    width: 100%;
    height: 100%;
    right: -28%;
    top: 17%;
    display: none;
    pointer-events: none;
    @include media('>medium') {
      display: block;
    }
  }
  .on-todays-show-person-social-wrapper {
    .connect {
      &:after {
        content: '';
        position: absolute;
        height: 125px;
        width: 2px;
        top: -22px;
        left: 0;
        background: rgba(map-get($colors, 'coolwhite'), 0.2);
      }
    }
  }
}
</style>
