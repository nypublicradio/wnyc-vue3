<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import { getMinutes, trackClickEvent, whenTime } from '~/utilities/helpers'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'

// TO DO - replace dummy data with BFF data
import episodeData from './episode-data.json'

// navigate back to home and track it
const backHome = () => {
  trackClickEvent('episode', 'episode page', 'back home button')
  navigateTo(`/shows/${episodeData?.['show-slug']}`)
}

const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

// handles play button click that updates the currentEpisode if it is a different file and togglePlayTrigger states
const togglePlay = (media) => {
  if (currentEpisode.value?.file !== media.file) {
    currentEpisode.value = media
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
  trackClickEvent(
    'Click Tracking - Episode Details Page',
    media.title,
    'toggle play'
  )
}
</script>

<template>
  <div v-if="episodeData" class="episode-page">
    <section class="">
      <div class="flex">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="backHome"
        />
        <h1>{{ episodeData?.show }}</h1>
      </div>
    </section>
    <div class="relative mb-4">
      <v-image
        v-if="episodeData?.image"
        :src="episodeData?.image"
        :ratio="[3, 2]"
        :alt="episodeData?.title"
        class="episode-page-image mb-2"
      />
      <v-image
        v-if="episodeData?.['show-logo']"
        :src="episodeData?.['show-logo']"
        :ratio="[1, 1]"
        :alt="episodeData?.show"
        class="episode-page-show-image mb-2"
      />
    </div>
    <section>
      <p class="episode-page-date mb-1">{{ whenTime(episodeData) }}</p>
      <h1 class="mb-3 alt">{{ episodeData?.title }}</h1>
      <PlayButton
        :label="getMinutes(episodeData?.duration)"
        :episode="episodeData"
        @onClick="togglePlay(episodeData)"
        class="mb-5"
      />
      <div class="episode-page-body" v-html="episodeData?.episodeBody" />
    </section>
    <section v-if="episodeData?.episodeTranscript">
      <h3 class="mb-4">Transcript</h3>
      <div
        class="episode-page-transcript"
        v-html="episodeData?.episodeTranscript"
      />
    </section>
  </div>
</template>

<style lang="scss">
.episode-page .episode-page-image {
  width: 100%;
  max-height: 333.33px;
  aspect-ratio: 3/2;
  object-fit: cover;
}

.episode-page .episode-page-show-image {
  width: 72px;
  height: 72px;
  aspect-ratio: 1/1;
  position: absolute;
  bottom: -36px;
  left: 20px;
}

.episode-page .episode-page-date {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-6);
  color: var(--text-color);
  text-decoration: none;
  opacity: 70%;
}

.episode-page h1.alt {
  font-family: var(--font-family-header);
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-10);
}

.episode-page .star-icon {
  height: 28px;
  width: 28px;
}

.episode-page-body hr {
  margin: 1.5rem 0;
}
</style>
