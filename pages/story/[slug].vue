<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { trackClickEvent, whenTime } from '~/utilities/helpers'

// TO DO - replace dummy data with BFF data
import storyData from './story-data.json'

const backHome = () => {
  trackClickEvent('story', 'story page', 'back home button')
  navigateTo('/home')
}
</script>

<template>
  <div v-if="storyData" class="story-page">
    <div class="px-3 py-2 flex align-items-center">
      <Button
        label="Home"
        link
        icon="pi pi-chevron-left"
        @click="backHome()"
        class="mr-2"
      />
    </div>
    <v-image
      v-if="storyData?.image"
      :src="storyData?.image.url"
      :ratio="[1, 1]"
      :alt="storyData?.image.alt"
      class="story-page-image mb-2"
    />
    <section>
      <pipe-data class="mb-3">
        <template #left>
          <nuxt-link :to="storyData.source_url" class="no-underline">
            {{ storyData.source }}
          </nuxt-link>
        </template>
        <template #right>
          <span class="nobreak">{{ whenTime(storyData) }}</span>
        </template>
      </pipe-data>
      <h1 class="mb-1">{{ storyData.title }}</h1>
      <p class="story-page-author mb-4">
        <v-byline :authors="storyData.authors" />
      </p>
      <div class="flex align-items-center">
        <icons-star-icon />
        <icons-share-icon class="ml-3" />
        <nuxt-link
          :to="`${storyData.url}#comments`"
          class="no-underline story-page-comments flex align-items-center ml-3"
        >
          <icons-comments-icon class="mr-2" /> comments
        </nuxt-link>
      </div>
    </section>
    <v-streamfield class="story-page-body" :streamfield="storyData.body" />
    <section>
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <top-stories />
    </section>
  </div>
</template>

<style lang="scss">
.story-page .p-button.p-button-link {
  color: var(--text-color);
}

.story-page .story-page-image {
  width: 100%;
  height: 242px;
  object-fit: cover;
}

.story-page .v-byline *,
.story-page .v-byline .flexible-link:not(.raw):not(.null),
.story-page .pipe-data *,
.story-page .story-page-comments {
  font-size: var(--font-size-4);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-6);
  color: var(--text-secondary-color);
  text-decoration: none;
}

.story-page .comments-icon path {
  fill: var(--text-color);
}

.story-page h1 {
  font-family: var(--font-family-header);
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-400);
  line-height: var(--font-size-10);
}

.story-page .star-icon {
  height: 28px;
  width: 28px;
}
</style>
