<script setup>
import { trackClickEvent } from "~/utilities/helpers"

import { useTopStories } from "~/composables/useTopStories"
const { topStories } = useTopStories()

const route = useRoute()
const router = useRouter()

const config = useRuntimeConfig()
const { $analytics } = useNuxtApp()

const storySource = "NPR"

const { data: storyData, status, error } = useLazyFetch(
  `${config.public.BFF_URL}/api/npr/${route.params.slug}`,
  {
    onResponse({ response }) {
      // send GA page view
      const res = response._data
      $analytics.sendPageView({
        page_title: res?.title,
        page_type: "article",
        content_group: `${storySource}_article`,
        article_authors: res?.authors?.map((author) => author.name).join(","),
        article_publish_date: res?.publicationDate,
        article_updated_date: res?.updatedDate ? res?.updatedDate : res?.publicationDate,
        article_title: res?.title,
      })
    },
    onResponseError() {
      globalToast.value = {
        severity: "error",
        summary: "We are having a problem loading this article. Please try again later.",
        life: 6000,
        closable: true,
      }
    },
  }
)

// navigate back to home and track it
const routeBack = () => {
  trackClickEvent("story", "story page", "route back")
  window.history.state.back ? router.go(-1) : navigateTo("/home")
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
    <!-- <pre>{{ storyData }}</pre> -->
    <section class="flex align-items-center py-0">
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
    </section>
    <EpisodeTemplate :pending="status !== 'success'" :episodeData="storyData" />

    <!-- <section class="thinContent">
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
      <FetchError v-if="error" />
    </section> -->
    <!-- <div v-if="status === 'success'" class="thinContent">
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
    </div> -->

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
