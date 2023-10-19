<script setup>
import VImage from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue'
import { getMinutes, trackClickEvent, getDate } from '~/utilities/helpers'
import { useTogglePlayTrigger, useCurrentEpisode } from '~/composables/states'
import StarIcon from '~/components/icons/StarIcon.vue'
import DownloadIcon from '~/components/icons/DownloadIcon.vue'
import ShareIcon from '~/components/icons/ShareIcon.vue'
import QueueIcon from '~/components/icons/QueueIcon.vue'
// TO DO - replace dummy data with BFF data
import episodeData from './episode-data.json'

// navigate back to home and track it
const backHome = () => {
  trackClickEvent('episode', 'episode page', 'back home button')
  navigateTo(`/shows/${episodeData?.showSlug}`)
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
const handleStar = () => {
  console.log('handleStar')
}
const handleDownload = () => {
  console.log('handleDownload')
}
const handleShare = () => {
  console.log('handleShare')
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: 'Favorite Episode',
      customIcon: StarIcon,
      active: false,
      title: bucketItem.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    {
      label: 'Download',
      //icon: 'pi pi-google',
      customIcon: DownloadIcon,
      title: bucketItem.title,
      command: () => {
        handleDownload(bucketItem)
      },
    },
    {
      label: 'Share',
      customIcon: ShareIcon,
      title: bucketItem.title,
      command: () => {
        handleShare(bucketItem)
      },
    },
    {
      label: 'Add to Queue',
      active: true,
      customIcon: QueueIcon,
      title: bucketItem.title,
      command: () => {
        handleAddToQueue(bucketItem)
      },
    },
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}
</script>

<template>
  <div v-if="episodeData" class="episode-page">
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
          :label="episodeData?.show"
        />
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
        v-if="episodeData?.showLogo"
        :src="episodeData?.showLogo"
        :ratio="[1, 1]"
        :alt="episodeData?.show"
        class="episode-page-show-image mb-2"
      />
    </div>
    <section>
      <p class="episode-page-date my-1">
        {{
          getDate(
            episodeData.updatedDate ?? episodeData.publishAt,
            'LLL d, yyyy'
          )
        }}
      </p>
      <h1 class="mb-3 alt">{{ episodeData?.title }}</h1>
      <div class="flex align-items-center justify-content-between mb-5">
        <PlayButton
          :label="getMinutes(episodeData?.duration)"
          :episode="episodeData"
          @onClick="togglePlay(episodeData)"
          class=""
        />
        <div class="flex gap-3">
          <Button class="w-2rem h-2rem" text plain rounded @click="handleStar">
            <template #icon> <StarIcon /></template>
          </Button>
          <Button
            class="w-2rem h-2rem"
            text
            plain
            rounded
            @click="handleDownload"
          >
            <template #icon> <DownloadIcon /></template>
          </Button>
          <Button class="w-2rem h-2rem" text plain rounded @click="handleShare">
            <template #icon> <ShareIcon /></template>
          </Button>
          <DotMenu
            :menuItems="getDotMenuItems(episodeData)"
            label=""
            @changeEmit="onMenuChange"
            width="32px"
            height="32px"
            class="-mr-1"
          >
            <template #header-bottom>
              <div>
                <div class="flex gap-3 px-4 align-items-center">
                  <VImage
                    :src="episodeData?.image"
                    :alt="`${episodeData?.title} show image`"
                    :width="60"
                    :height="60"
                    :sizes="[2]"
                    class="show-image-in-menu"
                    :ratio="[1, 1]"
                  />

                  <div class="info">
                    <h2>{{ episodeData?.title }}</h2>
                    <p>{{ episodeData?.show }}</p>
                  </div>
                </div>
                <hr class="mt-5 mb-2 dim" />
              </div>
            </template>
          </DotMenu>
        </div>
      </div>
      <div class="episode-page-body" v-html="episodeData?.episodeBody" />
    </section>
    <section v-if="episodeData?.episodeTranscript">
      <h3 class="mb-4">Transcript</h3>
      <div
        class="episode-page-transcript html-formatting"
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
  font-weight: var(--font-weight-600);
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
