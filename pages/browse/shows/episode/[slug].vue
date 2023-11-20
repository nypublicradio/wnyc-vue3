<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import { getMinutes, trackClickEvent, getDate } from "~/utilities/helpers"
import { useTogglePlayTrigger, useCurrentEpisode } from "~/composables/states"
import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import QueueIcon from "~/components/icons/QueueIcon.vue"
import { deleteFavorite, saveFavorite, checkIsFavorited } from "~/utilities/helpers"

const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const { data: episode } = useFetch(
  `${config.public.BFF_URL}/api/show/episode/${route.params.slug}`
)

const episodeData = ref(episode?.value?.episode ?? null)

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

const user = useCurrentUser()

// navigate back to home and track it
const backHome = () => {
  trackClickEvent("episode", "episode page", "back show page")
  navigateTo(`/browse/shows/${episodeData?.value.attributes.show}`)
}

const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

// handles play button click that updates the currentEpisode if it is a different file and togglePlayTrigger states

// normalize the bucket item data for the player
const prepForPlayer = (item, index = null) => {
  const isSegment = index !== null
  return {
    ...item,
    file: isSegment ? item.audio[index] : item.audio,
    title: isSegment ? item.segments[index].title : item.title,
    image: item.imageMain.template,
    //TODO convert to seconds
    duration: item.estimatedDuration,
    details: isSegment ? item.segments[index].tease : item.body,
    first_published_at: isSegment ? item.segments[index].newsdate : item.publishAt,
  }
}

const togglePlay = (media, index = null) => {
  if (index === null) {
    if (currentEpisode.value?.audio !== media.audio) {
      currentEpisode.value = prepForPlayer(media)
    }
  } else {
    // segment
    if (currentEpisode.value?.file !== media.audio[index]) {
      currentEpisode.value = prepForPlayer(media, index)
    }
  }

  togglePlayTrigger.value = !togglePlayTrigger.value

  trackClickEvent("Click Tracking - Episode Details Page", media.title, "toggle play")
}
const handleStar = () => {
  const episode = {
    cmsSource: cmsSources.PUBLISHER, // BONO TO DO: is this right to hardcode this?
    id: episodeData.value?.id,
    slug: episodeData.value?.attributes?.slug,
  }
  if (isFavorited.value) {
    deleteFavorite(episode)
    isFavorited.value = false
  } else {
    saveFavorite(episode, "episode")
    isFavorited.value = true
  }
}
const handleDownload = () => {
  console.log("handleDownload")
}
const handleShare = () => {
  console.log("handleShare")
}

// set the items for the Dot menu
const getDotMenuItems = (bucketItem) => {
  return [
    {
      label: "Favorite Episode",
      customIcon: StarIcon,
      active: isFavorited.value,
      title: bucketItem?.title,
      command: () => {
        handleAddToFavorites(bucketItem)
      },
    },
    {
      label: "Download",
      //icon: 'pi pi-google',
      customIcon: DownloadIcon,
      title: bucketItem?.title,
      command: () => {
        handleDownload(bucketItem)
      },
    },
    {
      label: "Share",
      customIcon: ShareIcon,
      title: bucketItem?.title,
      command: () => {
        handleShare(bucketItem)
      },
    },
    {
      label: "Add to Queue",
      active: true,
      customIcon: QueueIcon,
      title: bucketItem?.title,
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

const handleAddToFavorites = (bucketItem) => {
  handleStar()
  // update SB and LS with new state
  toast.add({
    severity: "info",
    summary: "Updated your favorites.",
    life: 3000,
  })
  trackClickEvent(
    "Click Tracking - Add/remove from favorites",
    "Expanded Audio Player",
    bucketItem.title
  )
}

watch(episode, () => {
  episodeData.value = episode.value.episode
  //console.log("ep = ", episodeData.value);
})
</script>

<template>
  <div class="episode-page">
    <!--  <pre class="text-xs">{{ episodeData }}</pre> -->
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
          :label="episodeData?.attributes.showTitle"
        />
      </div>
    </section>
    <div class="relative mb-4">
      <v-image
        v-if="episodeData"
        :src="episodeData?.attributes.imageMain.template"
        :width="390"
        :height="360"
        :ratio="[3, 2]"
        :srcset="[2]"
        :alt="episodeData?.attributes.imageMain.altText"
        class="episode-page-image mb-2"
      />
      <Skeleton v-else borderRadius="0px" height="auto" class="episode-page-image mb-2" />
      <v-image
        v-if="episodeData"
        :src="episodeData?.attributes.headers.brand.logoImage.template"
        :width="70"
        :height="70"
        :srcset="[2]"
        :ratio="[1, 1]"
        :alt="episodeData?.show"
        class="episode-page-show-image mb-2"
      />
      <Skeleton
        v-else
        borderRadius="0px"
        height="70px"
        width="70px"
        class="episode-page-show-image mb-2"
      />
    </div>
    <div v-if="episodeData">
      <section>
        <p class="episode-page-date my-1">
          {{
            getDate(
              episodeData?.attributes.updatedDate ?? episodeData?.attributes.publishAt,
              "LLL d, yyyy"
            )
          }}
        </p>
        <h1 class="mb-3 alt">{{ episodeData?.attributes?.title }}</h1>
        <div class="flex align-items-center justify-content-between">
          <div>
            <PlayButton
              v-if="!episodeData?.attributes?.segments"
              :label="getMinutes(episodeData?.attributes?.estimatedDuration, 1)"
              :file="episodeData?.attributes.audio"
              @onClick="togglePlay(episodeData?.attributes)"
              class=""
            />
          </div>
          <div class="flex gap-3">
            <Button
              v-if="user"
              class="w-2rem h-2rem"
              text
              plain
              rounded
              @click="handleStar"
            >
              <template #icon> <StarIcon :active="isFavorited" /></template>
            </Button>
            <Button class="w-2rem h-2rem" text plain rounded @click="handleDownload">
              <template #icon> <DownloadIcon /></template>
            </Button>
            <Button class="w-2rem h-2rem" text plain rounded @click="handleShare">
              <template #icon> <ShareIcon /></template>
            </Button>
            <DotMenu
              :menuItems="getDotMenuItems(episodeData?.attributes)"
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
                      :src="episodeData?.attributes.imageMain.template"
                      :alt="`${episodeData?.attributes?.title} show image`"
                      :width="60"
                      :height="60"
                      :sizes="[2]"
                      class="show-image-in-menu flex-none"
                      :ratio="[1, 1]"
                    />

                    <div class="info">
                      <h2>{{ episodeData?.attributes?.title }}</h2>
                      <p>{{ episodeData?.attributes?.showTitle }}</p>
                    </div>
                  </div>
                  <hr class="mt-5 mb-2 dim" />
                </div>
              </template>
            </DotMenu>
          </div>
        </div>
        <!-- SEGMENTS -->
        <div v-if="episodeData?.attributes?.segments" class="flex flex-column gap-3 mt-4">
          <div
            v-for="(segment, index) in episodeData?.attributes?.segments"
            :key="segment.title"
          >
            <div
              v-if="episodeData?.attributes.audio[index]"
              class="flex gap-3 align-items-center"
            >
              <PlayButton
                :label="segment.audioDurationReadable"
                :file="episodeData?.attributes.audio[index]"
                @onClick="togglePlay(episodeData?.attributes, index)"
              />
              <p class="truncate t2lines">{{ segment.title }}</p>
            </div>
          </div>
        </div>
        <div
          class="episode-page-body html-formatting mt-5"
          v-html="episodeData?.attributes?.body"
        />
      </section>
      <section v-if="episodeData?.attributes?.transcript">
        <h3 class="mb-4">Transcript</h3>
        <div
          class="episode-page-transcript html-formatting"
          v-html="episodeData?.attributes?.transcript"
        />
      </section>
    </div>
    <section v-else>
      <Skeleton height="12px" width="75px" borderRadius="16px" class="mb-2 opacity-50" />
      <Skeleton height="1.25rem" width="95%" borderRadius="16px" class="mb-1" />
      <Skeleton height="1.25rem" width="75%" borderRadius="16px" class="mb-1" />
      <div class="flex justify-content-between mt-4 mb-5">
        <div>
          <Skeleton height="29px" width="92px" borderRadius="16px" />
        </div>
        <div class="flex gap-3">
          <Skeleton height="29px" width="29px" borderRadius="16px" />
          <Skeleton height="29px" width="29px" borderRadius="16px" />
          <Skeleton height="29px" width="29px" borderRadius="16px" />
          <Skeleton height="29px" width="29px" borderRadius="16px" />
        </div>
      </div>
      <skeleton-text :lines="6" class="mt-1" />
    </section>
  </div>
</template>

<style lang="scss">
.episode-page .episode-page-image {
  width: 100%;
  height: auto;
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
