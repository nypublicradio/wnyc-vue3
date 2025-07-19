<script setup>
import { useCommentCounts, useUpdateCommentCounts } from "~/composables/comments"
import StarIcon from "~/components/icons/StarIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import CommentsIcon from "~/components/icons/CommentsIcon.vue"
import { cmsSources } from "~/composables/globals"
//import { ArticlePage, GalleryPage } from '~/composables/types/Page'
import { normalizeGalleryPage } from "~/composables/data/galleryPages"
import {
  checkIsFavorited,
  shareAPI,
  trackClickEvent,
  whenTime,
  getMinutes,
  togglePlayEpisode,
  addToFavorites2,
} from "~/utilities/helpers"

import { useCurrentUser } from "~/composables/states"

// TO DO - replace dummy data with BFF data
//import storyDataRaw from './story-data.json'
const route = useRoute()
const router = useRouter()

const user = useCurrentUser()
const config = useRuntimeConfig()

const { data: storyData, pending, error } = useFetch(
  `${config.public.BFF_URL}/api/story/${route.query.src}/${route.params.slug}`
)
const isWagtail = route.query.src === cmsSources.WAGTAIL
const storySource = isWagtail ? "Gothamist" : "WNYC"
const topStories = ref(null)
const gallery = ref(null)
const topImage = ref(null)
const topCaption = ref(null)
const galleryLength = ref(null)

const galleryLink = ref(null)

const commentCounts = ref(useCommentCounts())
const commentCount = computed(() => {
  const result = commentCounts.value[storyData?.value?.commentId]
  return result ?? 0
})

// navigate back to home and track it
const routeBack = () => {
  trackClickEvent("story", "story page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
}

const handleComments = () => {
  const activeStation = document.getElementById("comments")
  activeStation.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "start",
  })
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
const handleShare = () => {
  shareAPI(storyData.value, "story slug")
}

watch(
  storyData,
  async () => {
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

    if (storyData.value?.leadGallery) {
      gallery.value = await usePageById(
        storyData.value.leadGallery.gallery
      ).then(({ data }) => normalizeGalleryPage(data.value))
    }

    topImage.value = storyData.value?.image || gallery.value?.slides?.[0]?.image || null

    topCaption.value =
      storyData.value?.leadImageCaption ??
      topImage.value?.caption ??
      gallery.value?.slides?.[0]?.image.caption ??
      null

    if (storyData.value?.leadGallery) {
      galleryLength.value = gallery.value?.slides?.length ?? 0
      galleryLink.value = String(
        `photos/${storyData.value?.leadGallery.gallery}?article=${storyData.value?.id}&src=${route.query.src}`
      )
    }
    if (isWagtail) {
      // get comment count if Wagtail only
      useUpdateCommentCounts([storyData.value])
    }

    // handle top storied data
    const topStoriesData = await $fetch(`${config.public.BFF_URL}/api/homepagetopstories`)
    topStories.value = topStoriesData.top_stories.filter(
      (item) => item.id !== storyData.value?.id
    )
  },
  { once: true }
)

// handle the toggle play button and tracking
const togglePlayHere = (story) => {
  togglePlayEpisode(story, mediaTypes.EPISODE)
}
</script>

<template>
  <div class="story-page">
    <Html lang="en">
      <Head>
        <Title>{{ storyData?.title }} | WNYC</Title>
        <Meta name="og:title" :content="`${storyData?.title} | WNYC`" />
        <Meta name="twitter:title" :content="`${storyData?.title} | WNYC`" />
      </Head>
    </Html>
    <section class="">
      <!-- <pre class="text-xs">{{ storyData }}</pre> -->
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-3"
          icon="pi pi-chevron-left"
          rounded
          text
          severity="secondary"
          aria-label="back to previous page"
          @click="routeBack"
          label="Back"
        />
      </div>
    </section>
    <FetchError v-if="error" />
    <div v-if="!pending">
      <VImage
        v-if="topImage"
        :src="topImage"
        :maxWidth="storyData.image.width"
        :maxHeight="storyData.image.height"
        sizes="xs:390px md:768px"
        density="x1 x2"
        :alt="storyData.image.alt"
        class="story-page-image"
      >
        <template #caption>
          <VImageCaption v-if="storyData.image.caption" :text="storyData.image.caption" />
        </template>
        <template #gallery>
          <VImageGallery
            v-if="gallery?.slides"
            :count="String(gallery.slides.length)"
            :gallery-link="galleryLink"
          />
        </template>
        <template #belowImage>
          <div>
            <p class="text-right px-4 mt-1 type-fineprint">
              {{ storyData.image.credit }}
            </p>
          </div>
        </template>
      </VImage>
      <Skeleton
        v-else
        borderRadius="0px"
        height="auto"
        class="episode-page-image mb-2 opacity-60"
      />
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
        <div class="story-page-author opacity-70 mb-3 text-xs mt-2">
          <VByline v-if="storyData?.authors?.length > 0" :authors="storyData.authors" />
        </div>
        <div class="flex align-items-center justify-content-between gap-3 flex-wrap">
          <div v-if="storyData?.estimatedDuration">
            <PlayButton
              :label="getMinutes(storyData?.estimatedDuration, 1)"
              @onClick="togglePlayHere(storyData)"
              :data="storyData"
            />
          </div>
          <div class="flex align-items-center gap-2 -ml-2">
            <Button text plain rounded aria-label="star" @click="handleAddToFavorites">
              <template #icon> <StarIcon :active="isFavorited" /></template>
            </Button>
            <Button text plain rounded aria-label="share" @click="handleShare">
              <template #icon> <ShareIcon /></template>
            </Button>
            <Button
              v-if="isWagtail && commentCount > 0"
              text
              plain
              rounded
              :label="`&nbsp; ${String(commentCount)} ${
                commentCount === 1 ? 'comment' : 'comments'
              }`"
              class="comments-btn pl-2 text-xs font-normal"
              aria-label="comments"
              @click="handleComments()"
            >
              <template #icon> <CommentsIcon /></template>
            </Button>
          </div>
        </div>
      </section>

      <v-streamfield
        v-if="storyData?.body"
        class="story-page-body"
        :article="storyData"
      />

      <story-article-footer :article="storyData" />
    </div>
    <div v-else>
      <skeleton-article />
    </div>
    <section v-if="topStories">
      <Divider class="mt-2 mb-5" />
      <h2 class="mb-3">WNYC Picks</h2>
      <TopStories :articles="topStories" />
    </section>
    <BackToTopButton />
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

.story-page .story-page-image {
  width: 100vw;
  max-width: calc($contentWidth - 100px);
  margin: auto;
}
.story-page .v-byline .flexible-link {
  color: var(--p-text-color) !important;
  text-decoration: none !important;
}

.story-page .comments-btn {
  .comments-icon {
    margin-top: 3px;
  }
}
</style>
