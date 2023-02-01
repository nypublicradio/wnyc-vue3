<template>
  <div class="on-todays-show">
    <v-spacer v-if="headline" size="triple" />
    <div v-if="headline" class="l-grid l-grid--2up l-grid--1up--large l-grid--large-gutters">
      <h2 class="on-todays-show-title">
        Today on {{ title }}
      </h2>
    </div>
    <div class="l-grid l-grid--2up l-grid--1up--large l-grid--large-gutters">
      <div v-if="headline" class="on-todays-show-left l-grid--order-1-large">
        <p class="on-todays-show-headline">
          <a
            v-if="headlineLink"
            :href="headlineLink"
            target="_blank"
            rel="noopener"
            v-html="headline"
          />
          <span v-if="!headlineLink" v-html="headline" />
        </p>
        <template v-if="segments">
          <v-spacer size="triple" />
          <segment-list>
            <segment-list-item
              v-for="(segment, index) in segments.slice(0, segmentsToShow)"
              :key="index"
              :title="segment.title"
              :url="segment.url"
              :new-window="segment.newWindow"
              @componentEvent="gaEvent('Non-Player','Segment List', ...arguments)"
            />
            <v-button
              v-if="segments.length > segmentsToShow"
              label="show more"
              class="u-space--top"
              @click="showMoreSegments"
            />
          </segment-list>
        </template>
      </div>
      <div v-if="image" class="on-todays-show-right l-grid--order-2-large">
        <image-with-caption
          :alt-text="imageAltText"
          :image="image"
          width="506"
          height="327"
          :caption="imageCaption"
          :credit="imageCredits"
          :credit-url="imageCreditsUrl"
          @componentEvent="gaEvent('Non-Player','Photo Caption', ...arguments)"
        />
        <div class="dots" />
      </div>
    </div>
    <div v-if="hosts || social">
      <v-spacer size="triple" />
      <div class="on-todays-show-person-social-wrapper">
        <ul v-if="hosts" class="on-todays-show-person-list">
          <li v-for="(host, index) in hosts" :key="index" class="on-todays-show-person-item">
            <a
              target="_blank"
              rel="noopener"
              class="on-todays-show-person-link"
              :href="'https://www.wnyc.org'+host.url"
            >
              <v-person
                class="on-todays-show-person"
                role="host"
                :name="host['first-name'] + ' ' + host['last-name']"
                :image="host.image ? host.image : 'https://media.wnyc.org/i/raw/2021/01/radio_avatar.png'"
              />
            </a>
          </li>
        </ul>
        <share-tools v-if="social.twitter || social.instagram || social.facebook" class="on-todays-show-social" label="Connect with the show!" layout="vertical">
          <share-tools-item
            v-if="social.twitter"
            :username="social.twitter"
            service="twitter"
            @componentEvent="gaEvent('Non-Player','Social Follow', ...arguments)"
          />
          <share-tools-item
            v-if="social.instagram"
            :username="social.instagram"
            service="instagram"
            @componentEvent="gaEvent('Non-Player','Social Follow', ...arguments)"
          />
          <share-tools-item
            v-if="social.facebook"
            :username="social.facebook"
            service="facebook"
            @componentEvent="gaEvent('Non-Player','Social Follow', ...arguments)"
          />
        </share-tools>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import helpers from '@/mixins/helpers'
import gtm from '@/mixins/gtm'
import whatsOnNow from '@/mixins/whatsOnNow'

export default {
  name: 'WhatsOnNow',
  components: {
    ImageWithCaption: () => import('nypr-design-system-vue/src/components/ImageWithCaption'),
    SegmentList: () => import('nypr-design-system-vue/src/components/SegmentList'),
    SegmentListItem: () => import('nypr-design-system-vue/src/components/SegmentListItem'),
    ShareTools: () => import('nypr-design-system-vue/src/components/ShareTools'),
    ShareToolsItem: () => import('nypr-design-system-vue/src/components/ShareToolsItem'),
    VButton: () => import('nypr-design-system-vue/src/components/VButton'),
    VSpacer: () => import('nypr-design-system-vue/src/components/VSpacer'),
    VPerson: () => import('nypr-design-system-vue/src/components/VPerson')
  },
  mixins: [whatsOnNow, helpers, gtm],
  data () {
    return {
      segmentsToShow: 3
    }
  },
  computed: {
    ...mapState('whatsOnNow', {
      headline: state => state.selectedStream.onTodaysShowHeadline,
      headlineLink: state => state.selectedStream.onTodaysShowHeadlineLink,
      episodeLink: state => state.selectedStream.episodeLink,
      hosts: state => state.selectedStream.onTodaysShowHosts,
      image: state => state.selectedStream.onTodaysShowImage,
      imageAltText: state => state.selectedStream.onTodaysShowImageAltText,
      imageCaption: state => state.selectedStream.onTodaysShowImageCaption,
      imageCredits: state => state.selectedStream.onTodaysShowImageCredits,
      imageCreditsUrl: state => state.selectedStream.onTodaysShowImageCreditsUrl,
      segments: state => state.selectedStream.onTodaysShowSegments,
      social: state => state.selectedStream.onTodaysShowSocial,
      title: state => state.selectedStream.title
    })
  },
  mounted () {
    if (window.innerWidth > 850) {
      this.segmentsToShow = 6
    }
  },
  methods: {
    collapseSegments () {
      if (window.innerWidth > 850) {
        this.segmentsToShow = 6
      } else {
        this.segmentsToShow = 3
      }
    },
    showMoreSegments () {
      this.segmentsToShow = this.segments.length
      this.gaEvent('Non-Player', 'Segment List', 'Show More')
    }
  }
}
</script>

<style lang="scss">
.o-icon {
  border: none;
  fill: RGB(var(--color-text));
  z-index: 10;
}

.o-icon:hover {
  fill: RGB(var(--color-text));
  opacity: var(--opacity-hover);
}

.on-todays-show .dots {
  display: none;
  @include media(">medium") {
    display: block;
  }
}

.on-todays-show-person-social-wrapper {
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  @include media(">medium") {
    flex-direction: row;
  }
}

.on-todays-show-person-list {
  position: relative;
  flex: 1 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  row-gap: 24px;
  padding-bottom: 48px;
  @include media(">medium") {
    padding: 0;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    flex-basis: 280px;
  }
  @include media(">860px") {
    align-self: center;
  }
}

.on-todays-show-person-social-wrapper .on-todays-show-social {
  overflow-x: hidden;
  border-left: 1px solid rgba(234, 239, 240, 0.5);
  padding-left: 24px;
  width: 200px;
  flex-direction: column;
  justify-content: center;
  align-self: flex-start;
  @include media(">medium") {
    height: 124px;
    align-self: center;
    flex: 1 0 200px;
    padding-left: 48px;
    margin-top: 0;
  }

  .c-share-tools__label {
    flex-basis: auto;
  }
}

.on-todays-show-person-item {
  display: inline-block;
  list-style: none;
  width: 160px;
  @include media(">medium") {
    width: 280px;
  }
}

.on-todays-show-person.card.person-card {
  list-style: none;
  width: 160px;
  max-width: 160px;
  @include media(">medium") {
    width: 280px;
    max-width: 280px;
  }
}

.on-todays-show-person-link {
  border: none;
}
</style>
