<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import VImageCaption from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageCaption.vue'
import VImageGallery from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageGallery.vue'
import VByline from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue'
import { trackClickEvent, whenTime } from '~/utilities/helpers'
import { useCommentCounts } from '~/composables/comments'
import StarIcon from '~/components/icons/StarIcon.vue'
import ShareIcon from '~/components/icons/ShareIcon.vue'
import CommentsIcon from '~/components/icons/CommentsIcon.vue'
//import { ArticlePage, GalleryPage } from '~/composables/types/Page'
import { normalizeGalleryPage } from '~/composables/data/galleryPages'

// TO DO - replace dummy data with BFF data
//import storyDataRaw from './story-data.json'
const route = useRoute()
//console.dir(route)
//const storyData = humps.camelizeKeys(storyDataRaw)
const config = useRuntimeConfig()
const { data: storyData } = useFetch(
  `${config.public.BFF_URL}/api/story/${route.query.src}/${route.params.slug}`
)
const { data: stories } = useFetch(`${config.public.BFF_URL}/api/homepage`)
const topStories = ref(null)
const storySource = route.query.src === 'wagtail' ? 'Gothamist' : 'WNYC'
const gallery = ref(null)
const topImage = ref(null)
const topCaption = ref(null)
const galleryLength = ref(null)

const commentCounts = ref(useCommentCounts())
const commentCount = computed(() => {
  console.log(
    'commentCounts.value[storyData?.value.commentId] = ',
    commentCounts.value[storyData?.value.commentId]
  )
  return commentCounts.value[storyData?.value.commentId]
})

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

watch(stories, () => {
  topStories.value = stories.value.top_stories.filter(
    (item) => item.id !== storyData.value.id
  )
})

watch(storyData, async () => {
  console.dir(storyData.value)
  if (storyData.value.leadGallery) {
    gallery.value = await usePageById(storyData.value.leadGallery.gallery).then(
      ({ data }) => normalizeGalleryPage(data.value)
    )
  }
  topImage.value =
    storyData.value.leadImage ?? gallery?.slides?.[0]?.image ?? null
  topCaption.value =
    storyData.value.leadImageCaption ??
    topImage?.caption ??
    gallery.value?.slides?.[0]?.image.caption ??
    null
  galleryLength.value = gallery.value?.slides?.length ?? 0
  console.dir(gallery)
})
</script>

<template>
  <div class="story-page">
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

    <div v-if="storyData">
      <VImage
        v-if="storyData.image"
        :src="String(storyData.image.id)"
        :ratio="[3, 2]"
        sizes="xs:390px md:768px lg:1024px xl:1920px"
        density="x1 x2"
        :alt="storyData.image.alt"
        class="story-page-image"
      >
        <template #caption>
          <VImageCaption
            v-if="storyData.image.caption"
            :text="storyData.image.caption"
          />
        </template>
        <template #gallery>
          <VImageGallery
            v-if="gallery?.slides"
            :count="String(gallery.slides.length)"
            gallery-link="https://www.google.com"
          />
        </template>
        <template #belowImage>
          <div>
            <p class="text-right px-3 mt-1 text-xs">
              {{ storyData.image.credit }}
            </p>
          </div>
        </template>
      </VImage>

      <section>
        <PipeData class="my-2 text-xs opacity-70">
          <template #left>
            <span>
              {{ storySource }}
            </span>
          </template>
          <template #right>
            <span class="nobreak">{{ whenTime(storyData) }}</span>
          </template>
        </PipeData>
        <h1 class="mb-1 alt">{{ storyData.title }}</h1>
        <div class="story-page-author opacity-70 mb-3 text-xs mt-2">
          <VByline :authors="storyData.authors" />
        </div>
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
            :label="`&nbsp; ${String(commentCount)} ${
              commentCount === 1 ? 'comment' : 'comments'
            }`"
            class="comments-btn pl-2 text-xs font-normal"
            @click="handleComments()"
          >
            <template #icon> <CommentsIcon /></template>
          </Button>
        </div>
      </section>

      <v-streamfield class="story-page-body" :article="storyData" />

      <story-article-footer :article="storyData" />
    </div>
    <div v-else>
      <skeleton-article />
    </div>
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
.story-page .v-byline .flexible-link {
  color: var(--text-color) !important;
  text-decoration: none !important;
}

.story-page .comments-btn {
  .comments-icon {
    margin-top: 3px;
  }
}
</style>
