<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VShareTools from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareTools.vue'
import VShareToolsItem from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VShareToolsItem.vue'

import { resizePublisherImage, trackClickEvent } from '~/utilities/helpers'
import { useCurrentEpisodeHolder } from '~/composables/states'
const currentEpisodeHolder = useCurrentEpisodeHolder()

const hosts = computed(() => currentEpisodeHolder?.value.onTodaysShowHosts)
const social = computed(() => currentEpisodeHolder?.value.onTodaysShowSocial)
const segments = computed(
  () => currentEpisodeHolder?.value?.onTodaysShowSegments
)

//console.log('currentEpisodeHolder = ', currentEpisodeHolder)

const segmentsToShow = ref(3)

const trackHeadlineEvent = (headline) => {
  trackClickEvent(
    `Click Tracking - On Todays Show Headline`,
    'On Todays Show Headline',
    headline
  )
}

const trackSocialFollow = (social) => {
  trackClickEvent(`Click Tracking - Social Follow`, 'Social Follow', social)
}
</script>

<template>
  <div class="on-todays-show mt-7" v-if="currentEpisodeHolder">
    <div class="grid-nogutter lg:mb-3">
      <div class="overflow-hidden relative col-12 lg:col-6">
        <h2 class="headline font-bold font-meta inline">
          Today on {{ currentEpisodeHolder?.title }}
        </h2>
        <span class="title-line relative w-full"></span>
      </div>
    </div>

    <div
      v-if="currentEpisodeHolder?.onTodaysShowHeadline"
      class="flex column-gap-5 row-gap-2 flex-column-reverse flex-column lg:flex-row"
    >
      <div class="-mt-3 flex-1 relative">
        <div class="dots info"></div>
        <!-- the following is a duplicate headline and only shown on mobile <lg breakpoint -->
        <VFlexibleLink
          raw
          :to="currentEpisodeHolder?.onTodaysShowHeadlineLink"
          class="hidden lg:inline"
          @click="
            trackClickEvent(
              `Click Tracking - On Todays Show Headline`,
              'On Todays Show Headline',
              currentEpisodeHolder?.onTodaysShowHeadline
            )
          "
        >
          <h2
            class="text-2xl md:text-3xl lg:text-4xl"
            v-html="currentEpisodeHolder?.onTodaysShowHeadline"
          />
        </VFlexibleLink>
        <template v-if="segments">
          <SegmentList class="mt-6">
            <SegmentListItem
              v-for="(segment, index) in segments.slice(0, segmentsToShow)"
              :key="index"
              :title="segment.title"
              :url="segment.url"
              :new-window="segment.newWindow"
              @click-emit="
                trackClickEvent(
                  `Click Tracking - segments`,
                  'Segment List',
                  $event.url
                )
              "
            />
            <Button
              v-if="segments.length > segmentsToShow"
              class="show-more-btn mt-3 mx-auto"
              label="show more"
              @click="
                () => {
                  segmentsToShow = segments.length
                  trackClickEvent(
                    `Click Tracking - Show More`,
                    'Segment List Show More Button',
                    'Show More'
                  )
                }
              "
            />
          </SegmentList>
        </template>
      </div>
      <div class="flex-1 relative mt-0 lg:-mt-4">
        <div class="dots image"></div>
        <!-- the following is a duplicate headline and only shown on Desktop >lg breakpoint -->
        <VFlexibleLink
          raw
          :to="currentEpisodeHolder?.onTodaysShowHeadlineLink"
          class="lg:hidden"
          @click="
            trackHeadlineEvent(currentEpisodeHolder?.onTodaysShowHeadline)
          "
        >
          <h2
            class="text-2xl md:text-3xl lg:text-4xl"
            v-html="currentEpisodeHolder?.onTodaysShowHeadline"
          />
        </VFlexibleLink>
        <VImage
          class="show-image"
          v-if="currentEpisodeHolder?.onTodaysShowImageTemplate"
          loading="eager"
          :src="currentEpisodeHolder?.onTodaysShowImageTemplate"
          :to="currentEpisodeHolder?.onTodaysShowHeadlineLink"
          :width="584"
          :height="360"
          :alt="currentEpisodeHolder?.onTodaysShowImageAltText"
          :maxWidth="currentEpisodeHolder?.onTodaysShowImageMaxWidth"
          :maxHeight="currentEpisodeHolder?.onTodaysShowImageMaxHeight"
          :credit="currentEpisodeHolder?.onTodaysShowImageCredits"
          :credit-url="currentEpisodeHolder?.onTodaysShowImageCreditsUrl"
          :caption="currentEpisodeHolder?.onTodaysShowImageCaption"
          :ratio="[3, 2]"
          @image-click="
            trackClickEvent(
              `Click Tracking - On Todays Show image`,
              'On Todays Show image',
              $event
            )
          "
          @credit-click="
            trackClickEvent(
              `Click Tracking - On Todays Show image credit`,
              'On Todays Show image credit',
              $event
            )
          "
          @toggle-caption-expanded="
            trackClickEvent(
              `Click Tracking - On Todays Show caption`,
              'On Todays Show caption',
              'expanded'
            )
          "
          @toggle-caption-collapsed="
            trackClickEvent(
              `Click Tracking - On Todays Show caption`,
              'On Todays Show caption',
              'collapsed'
            )
          "
        />
      </div>
    </div>
    <template v-if="hosts || social">
      <!-- <pre>{{ hosts }}</pre>
      <pre>{{ social }}</pre>
      <pre>{{ currentEpisodeHolder }}</pre> -->
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
            <VFlexibleLink
              target="_blank"
              class="on-todays-show-person-link"
              :to="'https://www.wnyc.org' + host.url"
              raw
            >
              <PersonCard
                class="on-todays-show-person"
                role="host"
                :name="host['first-name'] + ' ' + host['last-name']"
                :image="
                  host.image
                    ? resizePublisherImage(host.image, 170, 170)
                    : 'https://media.wnyc.org/i/raw/2021/01/radio_avatar.png'
                "
                @person-emit="
                  trackClickEvent(
                    `Click Tracking - Show Participants`,
                    'Person Card',
                    `${$event.name} - ${$event.role}`
                  )
                "
              />
            </VFlexibleLink>
          </div>
        </div>
        <div
          class="connect flex justify-content-center flex-column col-12 md:col-6 pl-4 my-6 md:my-0 align-conent-center"
        >
          <p>Connect with the show!</p>
          <v-share-tools
            v-if="social.twitter || social.instagram || social.facebook"
            class="on-todays-show-social"
          >
            <v-share-tools-item
              v-if="social.twitter"
              :username="social.twitter"
              service="twitter"
              @follow="trackSocialFollow"
            />
            <v-share-tools-item
              v-if="social.instagram"
              :username="social.instagram"
              service="instagram"
              @follow="trackSocialFollow"
            />
            <v-share-tools-item
              v-if="social.facebook"
              :username="social.facebook"
              service="facebook"
              @follow="trackSocialFollow"
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
    pointer-events: none;
    /*     display: none;
    @include media('>sm') {
      display: block;
    } */
    &.info {
      width: 200px;
      height: 400px;
      left: -148%;
      top: 43%;
      @include media('<lg') {
        display: none;
      }
    }
    &.image {
      width: 100%;
      height: 100%;
      right: -28%;
      top: 17%;
      @include media('<lg') {
        height: 60%;
        top: 46%;
      }
    }
  }
  .on-todays-show-person-social-wrapper {
    .connect {
      min-height: 125px;
      border-left: 2px solid rgba(map-get($colors, 'coolwhite'), 0.2);
    }
  }
}
</style>
