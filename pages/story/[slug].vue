<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { trackClickEvent, whenTime } from '~/utilities/helpers'
import StarIcon from '~/components/icons/StarIcon.vue'
import ShareIcon from '~/components/icons/ShareIcon.vue'
import CommentsIcon from '~/components/icons/CommentsIcon.vue'
import humps from 'humps'

// TO DO - replace dummy data with BFF data
import storyDataRaw from './story-data.json'
const storyData = humps.camelizeKeys(storyDataRaw)
const config = useRuntimeConfig()
const { data: pagedata } = useFetch(`${config.public.BFF_URL}/api/homepage`)
const topStories = ref(pagedata?.value?.top_stories ?? null)

// navigate back to home and track it
const backHome = () => {
  trackClickEvent('story', 'story page', 'back home button')
  navigateTo('/home')
}

const handleComments = () => {
  console.log('handleComments')
  const activeStation = document.getElementById('comments')
  activeStation.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
    inline: 'start',
  })
}
const handleStar = () => {
  console.log('handleStar')
}
const handleShare = () => {
  console.log('handleShare')
}

watch(pagedata, () => {
  topStories.value = pagedata.value.top_stories
})
</script>

<template>
  <div v-if="storyData" class="story-page">
    <section class="">
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="backHome"
          label="Home"
        />
      </div>
    </section>
    <v-image
      v-if="storyData?.image"
      :src="storyData?.image.url"
      :ratio="[3, 2]"
      :alt="storyData?.image.alt"
      class="story-page-image"
    />
    <section class="py-0">
      <PipeData class="mt-3 mb-2 text-xs opacity-70">
        <template #left>
          <nuxt-link :to="storyData.source_url" class="no-underline">
            {{ storyData.source }}
          </nuxt-link>
        </template>
        <template #right>
          <span class="nobreak">{{ whenTime(storyData) }}</span>
        </template>
      </PipeData>
      <h1 class="mb-1 alt">{{ storyData.title }}</h1>
      <p class="story-page-author opacity-70 mb-3 text-xs">
        <VByline :authors="storyData.authors" />
      </p>
      <div class="flex align-items-center gap-2 -ml-2">
        <Button text plain rounded @click="handleStar()">
          <template #icon> <StarIcon /></template>
        </Button>
        <Button text plain rounded @click="handleShare()">
          <template #icon> <ShareIcon /></template>
        </Button>
        <Button
          text
          plain
          rounded
          :label="`&nbsp; ${storyData.comments} comments`"
          class="commnts-btn pl-2 text-xs font-normal"
          @click="handleComments()"
        >
          <template #icon> <CommentsIcon /></template>
        </Button>
      </div>
    </section>
    <v-streamfield class="story-page-body" :streamfield="storyData.body" />
    <section id="comments"><h2>Comments Section</h2></section>
    <section>
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>
  </div>
</template>

<style lang="scss">
.story-page h1.alt {
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-700);
  line-height: var(--font-size-10);
}

.story-page .star-icon {
  height: 28px;
  width: 28px;
}

.story-page .comments-btn {
}
</style>
