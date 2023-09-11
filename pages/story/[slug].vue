<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'

// TO DO - replace dummy data with BFF data
import storyData from './story-data.json'

// format the date to show X min ago, X hours ago, or the date in Month Day, YYYY format
const formatDate = (date) => {
  const dateObj = new Date(date)
  const now = new Date()
  const diff = now - dateObj
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor(diff / (1000 * 60))

  if (days > 0) {
    // return the date in Month Day, YYYY format
    return dateObj.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    })
  } else if (hours < 1) {
    return `${minutes} minutes ago`
  } else if (hours < 2) {
    return '1 hour ago'
  } else {
    return `${hours} hours ago`
  }
}
</script>

<template>
  <div v-if="storyData" class="story-page">
    <div class="p-3 flex align-items-center">
      <icons-back-arrow class="mr-2" />
      <h5><nuxt-link to="/home" class="no-underline">Home</nuxt-link></h5>
    </div>
    <v-image
      v-if="storyData?.image"
      :src="storyData?.image.url"
      :ratio="[1, 1]"
      :alt="storyData?.image.alt"
      class="story-page-image mb-2"
    />
    <section>
      <p class="story-page-date mb-3">
        <nuxt-link :to="storyData.source_url" class="no-underline">
          {{ storyData.source }}
        </nuxt-link>
        <span class="mx-1">|</span>
        {{ formatDate(storyData.updated_date) }}
      </p>
      <h1 class="mb-1">{{ storyData.title }}</h1>
      <p class="story-page-author mb-4">
        By
        <span v-for="(author, index) in storyData.authors" :key="index">
          <nuxt-link :to="author.url" class="no-underline">
            {{ author.name }}
          </nuxt-link>
          <span v-if="index < storyData.authors.length - 1">, </span>
        </span>
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

<style lang="scss" scoped>
.story-page-image {
  width: 100%;
  height: 242px;
  object-fit: cover;
}

.story-page-date,
.story-page-date a,
.story-page-author,
.story-page-author a,
.story-page-comments {
  font-size: 13px;
  font-weight: 400;
  line-height: 18px;
  color: rgba(16, 16, 18, 0.7);
}

.story-page h1 {
  font-size: 18px;
  font-weight: 500;
  line-height: 27px;
}

.story-page .star-icon {
  height: 28px;
  width: 28px;
}
</style>
