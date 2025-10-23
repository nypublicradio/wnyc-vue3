<script setup>
import StarIcon from "~/components/icons/StarIcon.vue"
//import ShareIcon from "~/components/icons/ShareIcon.vue"
import { isAlreadyDownloaded, fetchAndStoreMp3 } from "~/utilities/file-system"
import {
  checkIsFavorited,
  //shareAPI,
  trackClickEvent,
  whenTime,
  getMinutes,
  togglePlayEpisode,
  addToFavorites2,
} from "~/utilities/helpers"

import { useCurrentUser } from "~/composables/states"

const route = useRoute()
const router = useRouter()

const user = useCurrentUser()
const config = useRuntimeConfig()

const { data: storyData, status, error } = useLazyFetch(
  `${config.public.BFF_URL}/api/npr/${route.params.slug}`
)
const { data: topStoriesData, error: error2 } = useLazyFetch(
  `${config.public.BFF_URL}/api/homepagetopstories`
)

const storySource = "NPR"
const topStories = ref(null)

// navigate back to home and track it
const routeBack = () => {
  trackClickEvent("story", "story page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
}

const progress = ref({})
// handle the download of the audio file or multiple files request and feed the progress
const handleDownload = async (epD) => {
  trackClickEvent("Click Tracking - Audio Download", "Episode slug", epD.title)
  progress.value = await fetchAndStoreMp3(epD)
}

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)

watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: storyData.value,
    isFavorited: isFavorited.value,
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}
// handle share button
/* const handleShare = () => {
  shareAPI(storyData.value, "NPR story slug")
} */

watch(
  topStoriesData,
  () => {
    topStories.value = topStoriesData.value.top_stories.filter(
      (item) => item.id !== storyData.value?.id
    )
  },
  { once: true }
)

// use computed instead of watch, and fetch response for the analytics
//const storyData = computed(() => episode.value)

watch(
  storyData,
  () => {
    console.log("story data changed = ", storyData.value)
    // send GA page view
    const { $analytics } = useNuxtApp()
    $analytics.sendPageView({
      page_title: storyData.value?.title,
      page_type: "article",
      content_group: `${storySource}_article`,
      article_authors: storyData.value?.authors?.map((author) => author.name).join(","),
      article_publish_date: storyData.value?.publicationDate,
      article_updated_date: storyData.value?.updatedDate
        ? storyData.value?.updatedDate
        : storyData.value?.publicationDate,
      article_title: storyData.value?.title,
    })
  },
  { once: true }
)

// handle the toggle play button and tracking
const togglePlayHere = (story) => {
  togglePlayEpisode(story, mediaTypes.EPISODE)
}
</script>

<template>
  <div class="npr-story-page">
    <Html lang="en">
      <Head>
        <Title>{{ storyData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${storyData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${storyData?.title} | WNYC`" />
      </Head>
    </Html>
    <section class="thinContent">
      <!-- <pre class="text-xs">{{ storyData }}</pre> -->
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-3 mb-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="routeBack"
          label="Back"
        />
      </div>
      <FetchError v-if="error || error2" />
    </section>
    <div v-if="status === 'success'" class="thinContent">
      <VImage
        v-if="storyData.image"
        :src="storyData.image"
        :maxWidth="storyData.width"
        :maxHeight="storyData.height"
        :size="{
          xs: [375, 250],
          sm: [576, 384],
          md: [768, 512],
        }"
        :alt="storyData.alt"
        class="npr-story-page-image mb-4 md:px-4"
      >
        <template #caption>
          <VImageCaption
            v-if="storyData.leadImageCaption"
            :text="storyData.leadImageCaption"
          />
        </template>
        <!--         <template #gallery>
          <VImageGallery
            v-if="gallery?.slides"
            :count="String(gallery.slides.length)"
            :gallery-link="galleryLink"
          />
        </template> -->
        <!--         <template #belowImage>
          <div>
            <p class="text-left px-4 mt-1 text-xs">
              {{ storyData.image.credit }}
            </p>
          </div>
        </template> -->
      </VImage>
      <section>
        <PipeData class="my-2 text-xs opacity-70">
          <template #left>
            <span>
              {{ storySource }}
            </span>
          </template>
          <template #right>
            {{ whenTime(storyData) }}
          </template>
        </PipeData>
        <h1 class="mb-1 alt">{{ storyData?.title }}</h1>
        <div class="npr-story-page-author opacity-70 mb-3 text-xs mt-2">
          <VByline v-if="storyData?.authors?.length > 0" :authors="storyData.authors" />
        </div>
        <div class="flex align-items-center justify-content-between gap-3 flex-wrap">
          <div v-if="storyData?.estimatedDuration" class="flex align-items-center gap-2">
            <PlayButton
              :label="getMinutes(storyData?.estimatedDuration, 1)"
              @onClick="togglePlayHere(storyData)"
              :data="storyData"
            />
            <DownloadProgress
              v-if="
                (progress && Object.keys(progress).length > 0) ||
                isAlreadyDownloaded(storyData)
              "
              :isDownloaded="isAlreadyDownloaded(storyData)"
              :progress="progress"
              :animateComplete="!isAlreadyDownloaded(currentEpisode)"
            />
          </div>
          <div class="flex align-items-center gap-2 -ml-2">
            <Button text plain rounded aria-label="star" @click="handleAddToFavorites">
              <template #icon> <StarIcon :active="isFavorited" /></template>
            </Button>
            <Button
              v-if="storyData?.estimatedDuration"
              class="w-2rem h-2rem"
              text
              plain
              rounded
              aria-label="download"
              @click="handleDownload(storyData)"
            >
              <template #icon> <DownloadIcon /></template>
            </Button>
            <!--      <Button text plain rounded aria-label="share" @click="handleShare">
              <template #icon> <ShareIcon /></template>
            </Button> -->
          </div>
        </div>
        <v-streamfield
          v-if="storyData?.body"
          class="npr-story-page-body"
          :article="storyData"
        />

        <story-article-footer :article="storyData" :isDisableComments="true" />
      </section>
    </div>
    <div v-else class="thinContent">
      <skeleton-article />
    </div>

    <section v-if="topStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">Top Stories From Gothamist</h2>
      <TopStories :articles="topStories" />
    </section>
    <BackToTopButton />
  </div>
</template>

<style lang="scss" scoped>
.npr-story-page h1.alt {
  font-size: var(--font-size-8);
  font-weight: var(--font-weight-700);
  line-height: var(--font-size-10);
}

.npr-story-page .star-icon {
  height: 28px;
  width: 28px;
}
.npr-story-page .v-byline .flexible-link {
  color: var(--p-text-color) !important;
  text-decoration: none !important;
}

.npr-story-page .comments-btn {
  .comments-icon {
    margin-top: 3px;
  }
}
</style>

<style lang="scss">
// because it does not saw "read more" right now, we will center the name
.npr-story-page .article-footer .v-person .author-profile {
  align-items: center !important;
}
</style>
