<script setup>
import { useToast } from "primevue/usetoast"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import StarIcon from "~/components/icons/StarIcon.vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
import {
  deleteFavorite,
  saveFavorite,
  checkIsFavorited,
  getFavoritedItems,
  togglePlayEpisode,
  shareAPI,
  trackClickEvent,
  goToEpisodePage,
} from "~/utilities/helpers"
import {
  useCurrentUser,
  useAccountPromptSideBar,
  useIsEpisodePlaying,
} from "~/composables/states"
import { FALLBACKIMAGE } from "~/composables/globals"

const config = useRuntimeConfig()
const route = useRoute()
const toast = useToast()
const { data: show } = useFetch(`${config.public.BFF_URL}/api/show/${route.params.slug}`)

const pagination = ref(show?.value?.episodes?.meta ?? null)
const episodes = ref(show?.value?.episodes?.data ?? null)
const showImage = ref(show?.value?.show?.image?.template ?? null)
const showTitle = ref(show?.value?.show?.title ?? null)
const showTease = ref(show?.value?.show?.description ?? null)

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

const accountPromptSideBar = useAccountPromptSideBar()
const user = useCurrentUser()
const isEpisodePlaying = useIsEpisodePlaying()

// navigate back to home and track it
const backHome = () => {
  navigateTo("/browse")
}

// finds first episode with audio to play
const firstEpisodeWithAudio = () => {
  return episodes.value.find((ep) => {
    if (Array.isArray(ep.audio) && ep.audio[0] !== null) {
      return ep
    } else if (typeof ep.audio === "string") {
      return ep
    } else {
      return null
    }
  })
}
// handle the toggle play button at the top to play the most recent episode with audio and tracking
const togglePlayMostRecentEpisode = () => {
  const ep = firstEpisodeWithAudio()
  togglePlayEpisode(ep)
}
const handleAddToFavorites = async () => {
  if (user.value) {
    if (isFavorited.value) {
      await deleteFavorite(show.value.show)
      getFavoritedItems()
      isFavorited.value = false
    } else {
      await saveFavorite(show.value.show, "show")
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
      "Shows Page",
      show.value.show.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}
const handleShare = () => {
  shareAPI(show.value.show, "shows slug")
}

watch(show, () => {
  pagination.value = show.value.episodes?.meta
  episodes.value = show.value.episodes?.data
  showImage.value = show.value.show?.image?.template ?? FALLBACKIMAGE
  showTitle.value = show.value.show?.title
  showTease.value = show.value.show?.description
})
</script>

<template>
  <section class="shows-page pb-7">
    <div class="flex align-items-center">
      <Button
        class="back-btn text-color -ml-4"
        icon="pi pi-chevron-left"
        rounded
        text
        severity="secondary"
        aria-label="back to previous page"
        @click="backHome"
        label="Browse"
      />
    </div>

    <VImage
      v-if="showImage"
      :src="showImage"
      :alt="`${showTitle} show image`"
      :width="144"
      :height="144"
      class="show-image max-w-9rem m-auto"
      :ratio="[1, 1]"
      :srcset="[2]"
      style="min-height: 144px"
    />
    <Skeleton
      v-else
      class="flex-none show-image max-w-9rem m-auto"
      height="144px"
      width="144px"
      borderRadius="0px"
    />
    <div
      v-if="show"
      class="flex justify-content-center align-items-center gap-2 mt-2 mb-4"
    >
      <Button rounded text plain @click="handleAddToFavorites">
        <template #icon> <StarIcon :active="isFavorited" class="w-2rem" /></template>
      </Button>

      <Button
        class="play-btn flex-none"
        severity="secondary"
        rounded
        @click="togglePlayMostRecentEpisode"
      >
        <template #icon>
          <PauseIcon v-if="isEpisodePlaying" />
          <PlayIcon v-else />
        </template>
      </Button>

      <Button text plain rounded @click="handleShare">
        <template #icon> <ShareIcon /></template>
      </Button>
    </div>
    <div v-else class="flex justify-content-center align-items-center gap-2 mt-2 mb-4">
      <Skeleton height="37px" width="37px" borderRadius="20px" />
      <Skeleton height="48px" width="48px" borderRadius="24px" />
      <Skeleton height="37px" width="37px" borderRadius="20px" />
    </div>
    <div v-if="show">
      <h2 class="text-lg mt-2">{{ showTitle }}</h2>
      <div class="text-sm mt-2 html-formatting" v-html="showTease" />
    </div>
    <div v-else>
      <Skeleton
        height="16px"
        width="45%"
        borderRadius="16px"
        style="margin-bottom: 9px"
      />
      <Skeleton
        height="12px"
        width="95%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
      <Skeleton
        height="12px"
        width="90%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
      <Skeleton
        height="12px"
        width="75%"
        borderRadius="16px"
        style="margin-bottom: 6px"
      />
    </div>
    <h2 class="mt-4">Episodes</h2>
    <div class="flex flex-column gap-4 mt-2">
      <template v-if="show">
        <EpisodeItem
          v-for="ep in episodes"
          :data="ep"
          :key="ep.id"
          @onClick="goToEpisodePage(ep)"
          :fallback-image="showImage"
        />
      </template>
      <skeleton-episode-item v-else v-for="i in 10" :key="`sk1-${i}`" />
    </div>
    <BackToTopButton />
  </section>
</template>

<style lang="scss">
.shows-page {
  .play-btn {
    width: 50px !important;
    height: 50px !important;
    svg {
      width: 1.5rem;
      height: 1.5rem;
      margin-left: 5px;
    }
  }
}
</style>
