<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import VImageCaption from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageCaption.vue"
import VImageGallery from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageGallery.vue"
import VByline from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VByline.vue"
import { useCommentCounts, useUpdateCommentCounts } from "~/composables/comments"
import StarIcon from "~/components/icons/StarIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import CommentsIcon from "~/components/icons/CommentsIcon.vue"
import { cmsSources } from "~/composables/globals"
//import { ArticlePage, GalleryPage } from '~/composables/types/Page'
import { normalizeGalleryPage } from "~/composables/data/galleryPages"
import {
  deleteFavorite,
  saveFavorite,
  checkIsFavorited,
  getFavoritedItems,
  shareAPI,
  trackClickEvent,
  whenTime,
  getMinutes,
  togglePlayEpisode,
} from "~/utilities/helpers"

import { useCurrentUser, useAccountPromptSideBar } from "~/composables/states"

// TO DO - replace dummy data with BFF data
//import storyDataRaw from './story-data.json'
const route = useRoute()
const router = useRouter()

const accountPromptSideBar = useAccountPromptSideBar()
const user = useCurrentUser()
const config = useRuntimeConfig()
const { data: storyData, pending, error, refresh } = useFetch(
  `${config.public.BFF_URL}/api/story/${route.query.src}/${route.params.slug}`
)
const storySource = route.query.src === cmsSources.WAGTAIL ? "Gothamist" : "WNYC"
const { data: stories } = useFetch(`${config.public.BFF_URL}/api/homepage`)
const topStories = ref(null)
const gallery = ref(null)
const topImage = ref(null)
const topCaption = ref(null)
const galleryLength = ref(null)

const galleryLink = ref(null)

const commentCounts = ref(useCommentCounts())
const commentCount = computed(() => {
  return commentCounts.value[storyData?.value.commentId]
})

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)

watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
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
const handleAddToFavorites = async () => {
  if (user.value) {
    if (isFavorited.value) {
      await deleteFavorite(storyData.value)
      getFavoritedItems()
      isFavorited.value = false
    } else {
      await saveFavorite(storyData.value, storyData.value.type)
      getFavoritedItems()
      isFavorited.value = true
    }
    toast.add({
      severity: "info",
      summary: "Updated your favorites.",
      life: 3000,
    })
    trackClickEvent(
      "Click Tracking - Add/remove from favorites",
      "Story Page",
      storyData.value.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}
const handleShare = () => {
  shareAPI(storyData.value, "story slug")
}

watch(stories, () => {
  topStories.value = stories.value.top_stories.filter(
    (item) => item.id !== storyData.value?.id
  )
})

watch( storyData, async () => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView( {
    page_title: storyData.value.title,
    page_type: 'article',
    content_group: `${storySource}_article`,
    article_authors: storyData.value.authors.map(author => author.name).join(','),
    article_publish_date: storyData.value.publicationDate,
    article_updated_date: storyData.value.updatedDate ? storyData.value.updatedDate : storyData.value.publicationDate,
    article_title: storyData.value.title,
  } )

  //console.log("storyData = ", storyData.value)
  if (storyData.value?.leadGallery) {
    gallery.value = await usePageById(
      storyData.value.leadGallery.gallery
    ).then(({ data }) => normalizeGalleryPage(data.value))
  }
  topImage.value =
    storyData.value?.cmsSource === cmsSources.WAGTAIL
      ? String(storyData.value?.image?.id)
      : storyData.value?.image?.template ?? gallery?.slides?.[0]?.image ?? null

  topCaption.value =
    storyData.value?.leadImageCaption ??
    topImage?.caption ??
    gallery.value?.slides?.[0]?.image.caption ??
    null

  if (storyData.value?.leadGallery) {
    galleryLength.value = gallery.value?.slides?.length ?? 0
    galleryLink.value = String(
      `photos/${storyData.value?.leadGallery.gallery}?article=${storyData.value?.id}&src=${route.query.src}`
    )
  }
  // get comment count
  useUpdateCommentCounts([storyData.value])
})

// handle the toggle play button and tracking
const togglePlayHere = (story, index = 0) => {
  togglePlayEpisode(story, index)
}
</script>

<template>
  <div class="story-page">
    <Html lang="en">
      <Head>
        <Title>{{ storyData?.title }} | WNYC</Title>
        <Meta
          name="og:title"
          content="{{storyData?.title}} | WNYC"
        />
        <Meta
          name="twitter:title"
          content="{{storyData?.title}} | WNYC"
        />
      </Head>
    </Html>
    <section class="">
      <div class="flex align-items-center">
        <Button
          class="back-btn text-color -ml-4"
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
    <FetchError v-if="error" @on-click="refresh" />
    <div v-if="!pending">
      <VImage
        v-if="topImage"
        :src="topImage"
        :maxWidth="storyData.image.width"
        :maxHeight="storyData.image.height"
        sizes="xs:390px md:768px lg:1024px xl:1920px"
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
            <p class="text-left px-4 mt-1 text-xs">
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
          <VByline v-if="storyData.authors.length > 0" :authors="storyData.authors" />
        </div>
        <div class="flex align-items-center justify-content-between gap-3 flex-wrap">
          <div v-if="storyData.estimatedDuration">
            <PlayButton
              :label="getMinutes(storyData.estimatedDuration, 1)"
              @onClick="togglePlayHere(storyData)"
              :data="storyData"
            />
          </div>
          <div class="flex align-items-center gap-2 -ml-2">
            <Button text plain rounded @click="handleAddToFavorites">
              <template #icon> <StarIcon :active="isFavorited" /></template>
            </Button>
            <Button text plain rounded @click="handleShare">
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
