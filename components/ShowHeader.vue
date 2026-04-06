<script setup>
import { toRefs, computed } from "vue"
import FollowIcon from "~/components/icons/FollowIcon.vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"

import {
  checkIsFavorited,
  togglePlayEpisode,
  hasAudio,
  addToFavorites2,
  isolateSlug,
} from "~/utilities/helpers"
import { useFallbackImages } from "~/composables/useFallbackImages"
import {
  useCurrentUser,
  useIsEpisodePlaying,
  useIsApp,
  useAppDownloadLink,
  useCurrentEpisodeHolder,
  useCurrentEpisode,
  useIsLiveStream,
} from "~/composables/states"
//import { mediaTypeRoutes, mediaTypes } from "~/composables/globals"
import useSleepTimer from "~/composables/useSleepTimer"
import useLiveStream from "~/composables/data/liveStream"

const { getStationBySlugAndPlayIt } = useLiveStream()
const props = defineProps({
  show: {
    type: Object,
    default: null,
  },
})

//const emit = defineEmits(["change", "click"]);
const { show } = toRefs(props)
const currentEpisodeHolder = useCurrentEpisodeHolder()
const currentEpisode = useCurrentEpisode()

// Computed properties derived from the show data
const showImage = computed(
  () =>
    show.value?.image ||
    show.value?.showArt ||
    show.value?.linkedDataSource?.value?.imageUrl
)
const topperTitle = computed(
  () => show.value?.topper?.topperTitle || show.value?.title
)
const topperDescription = computed(() => show.value?.topper?.topperDescription)
const topperBackground = computed(() => {
  if (show.value?.topper?.topperBackground.includes("background:")) {
    return show.value?.topper?.topperBackground
  } else if (show.value?.topper?.topperBackground.includes("#")) {
    return `background: ${show.value?.topper?.topperBackground}`
  } else {
    return "background: var(--p-surface-950)"
  }
})
//const showScheduleSummary = computed(() => show.value?.scheduleSummary)
//const showSlug = computed(() => show.value?.meta?.slug)
// const showType = computed(() => show.value?.type)
// const canDownload = computed(() => show.value?.canDownloadEpisodes)
// const canEmbed = computed(() => show.value?.canEmbedEpisodes)

const route = useRoute()
const appDownloadLink = useAppDownloadLink()

const isApp = useIsApp()
const user = useCurrentUser()
const isEpisodePlaying = useIsEpisodePlaying()
const isLiveStream = useIsLiveStream()
const { getEpisodeFallBackImage } = useFallbackImages()
const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// finds first episode with audio to play
const firstEpisodeWithAudio = () => {
  const curatedList = show.value?.body?.find(
    (item) => item.type === "curated_list"
  )
  return curatedList?.value?.list?.listItems?.find((item) => {
    if (hasAudio(item.audio)) {
      return true
    } else if (typeof item.audio === "string") {
      return true
    } else {
      return false
    }
  })
}
// computed properties to identify what is currently loaded
const isLoadedEpisode = computed(() => {
  return (
    !isLiveStream.value && currentEpisode.value?.showTitle === props.show?.title
  )
})

const isLoadedLiveStream = computed(() => {
  return (
    isLiveStream.value &&
    (currentEpisodeHolder.value?.title === props.show?.title ||
      currentEpisode.value?.title === props.show?.title)
  )
})

// check if the show is currently live
const isCurrentlyLive = computed(() => {
  return (
    isolateSlug(currentEpisodeHolder.value?.detailsLink) ===
    props.show.meta.slug
  )
})
// handle the toggle play button at the top to play the most recent episode with audio and tracking
const togglePlayMostRecentEpisode = () => {
  if (isLoadedEpisode.value) {
    togglePlayEpisode(currentEpisode.value)
  } else if (isLoadedLiveStream.value) {
    getStationBySlugAndPlayIt(currentEpisodeHolder.value.slug, true)
  } else if (isCurrentlyLive.value) {
    getStationBySlugAndPlayIt(currentEpisodeHolder.value.slug, true)
  } else {
    const ep = firstEpisodeWithAudio()
    if (ep) {
      togglePlayEpisode(ep)
    }
  }
}

// watch(
//   currentEpisodeHolder,
//   () => {
//     currentEpisodeHolder.value.title = "All Of It with Alison Stewart"
//   },
//   { once: true }
// )

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: show.value,
    isFavorited: isFavorited.value,
    message: "Updated your followed shows.",
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}

const isThisShowPlaying = computed(() => {
  return (
    isEpisodePlaying.value &&
    (isLoadedEpisode.value || isLoadedLiveStream.value)
  )
})
</script>



<template>
  <div
    class="show-header-holder py-3 style-mode-dark"
    :style="topperBackground"
  >
    <section class="grid grid-nogutter m-auto">
      <div class="col-fixed hidden xxl:block w-20rem"></div>
      <div class="col">
        <div
          class="show-header flex justify-content-start gap-3 md:gap-5"
          :class="isApp ? 'justify-content-center' : 'justify-content-start'"
        >
          <!-- <pre class="text-white">{{ showSlug }}</pre> -->
          <VImage
            v-if="show"
            :src="showImage"
            :srcFallback="getEpisodeFallBackImage()"
            :alt="`${topperTitle} show image`"
            :size="{ xs: [112, 112], md: [208, 208] }"
            class="flex-none show-image w-7rem md:w-13rem"
            :srcset="[2]"
          />
          <Skeleton
            v-else
            class="flex-none show-image w-7rem md:w-13rem h-7rem md:h-13rem"
            borderRadius="0px"
          />
          <div v-if="!isApp">
            <div
              v-if="show"
              class="flex flex-column justify-content-start gap-2"
            >
              <transition name="zoom">
                <LiveBadge
                  v-if="isCurrentlyLive"
                  class="mb-1 align-self-start"
                />
              </transition>
              <h2 class="line-height-1 text-2xl md:text-6xl">
                {{ topperTitle }}
              </h2>
              <!-- <p v-if="showScheduleSummary" class="mt-0 md:-mt-3">
                {{ showScheduleSummary }}
              </p> -->
              <p
                v-if="topperDescription"
                class="hidden md:block text-sm md:text-base"
              >
                {{ topperDescription }}
              </p>
              <!-- desktop buttons -->
              <div class="hidden md:flex align-items-center gap-3">
                <Button
                  class="play-btn flex-none"
                  severity="secondary"
                  rounded
                  aria-label="play toggle"
                  tabindex="0"
                  @click="togglePlayMostRecentEpisode"
                >
                  <template #icon>
                    <PauseIcon v-if="isThisShowPlaying" />
                    <PlayIcon v-else />
                  </template>
                </Button>

                <Button
                  rounded
                  severity="secondary"
                  :aria-label="isFavorited ? 'Unfollow' : 'Follow'"
                  :label="isFavorited ? 'Unfollow' : 'Follow'"
                  @click="handleAddToFavorites"
                >
                  <template #icon>
                    <FollowIcon
                      :active="isFavorited"
                      style="height: 20px; width: 20px"
                    />
                  </template>
                </Button>

                <SleepTimerButton
                  v-if="isApp"
                  @emit-click="handleSleepTimer"
                  :isActive="sleepTimerRunning"
                  :isText="false"
                  label="Sleep Timer"
                  iconClass=""
                  iconStyles="height: 20px; width: 20px;"
                />
                <Button
                  v-else
                  label="Listen in the app"
                  severity="secondary"
                  rounded
                  aria-label="Listen in the app"
                  class=""
                  @click="
                    navigateTo(appDownloadLink, {
                      external: appDownloadLink.startsWith('http')
                        ? true
                        : false,
                    })
                  "
                >
                  <template #icon>
                    <DevicesIcon style="height: 20px; width: 20px" />
                  </template>
                </Button>
              </div>
            </div>
            <div v-else class="hidden md:flex flex-column gap-3 w-full">
              <div class="flex flex-column gap-0">
                <Skeleton
                  class="my-2"
                  height="48px"
                  width="65%"
                  borderRadius="24px"
                />
                <!-- <Skeleton
                  v-if="showScheduleSummary"
                  height="14px"
                  width="35%"
                  borderRadius="24px"
                /> -->
              </div>
              <div class="flex flex-column gap-2">
                <Skeleton height="14px" width="100%" borderRadius="24px" />
                <Skeleton height="14px" width="100%" borderRadius="24px" />
                <Skeleton height="14px" width="72%" borderRadius="24px" />
              </div>
              <div class="flex gap-3">
                <Skeleton height="48px" width="48px" borderRadius="24px" />
                <Skeleton height="41px" width="99px" borderRadius="24px" />
                <Skeleton height="41px" width="178px" borderRadius="24px" />
              </div>
            </div>
          </div>
        </div>
        <!-- mobile buttons -->
        <div
          v-if="show"
          class="flex md:hidden justify-content-center align-items-center gap-2 mt-3"
        >
          <Button
            rounded
            text
            plain
            :aria-label="isFavorited ? 'Unfollow' : 'Follow'"
            @click="handleAddToFavorites"
          >
            <template #icon>
              <FollowIcon :active="isFavorited" class="w-2rem mt-1"
            /></template>
          </Button>

          <Button
            class="play-btn flex-none"
            severity="secondary"
            rounded
            aria-label="play toggle"
            tabindex="0"
            @click="togglePlayMostRecentEpisode"
          >
            <template #icon>
              <PauseIcon v-if="isThisShowPlaying" />
              <PlayIcon v-else />
            </template>
          </Button>

          <SleepTimerButton
            v-if="isApp"
            @emit-click="handleSleepTimer"
            :isActive="sleepTimerRunning"
            :isText="true"
            class="mt-1"
          />
          <Button
            v-else
            label=""
            severity="secondary"
            rounded
            text
            plain
            class=""
            aria-label="Listen in the app"
            @click="
              navigateTo(appDownloadLink, {
                external: appDownloadLink.startsWith('http') ? true : false,
              })
            "
          >
            <template #icon>
              <DevicesIcon class="h-2rem w-2rem mt-1" />
            </template>
          </Button>
        </div>
        <div
          v-else
          class="flex md:hidden justify-content-center align-items-center gap-2 mt-3"
        >
          <Skeleton height="37px" width="37px" borderRadius="20px" />
          <Skeleton height="48px" width="48px" borderRadius="24px" />
          <Skeleton height="37px" width="37px" borderRadius="20px" />
        </div>
      </div>
      <div class="col-fixed hidden xl:block w-20rem"></div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.show-header-holder {
  .show-header {
    .play-btn {
      width: 50px !important;
      height: 50px !important;
      svg {
        width: 1.25rem;
        height: 1.25rem;
        margin-left: 2px;
      }
    }
  }
  @include media("<md") {
    .play-btn {
      width: 50px !important;
      height: 50px !important;
      svg {
        height: 18.11px;
        width: 13.53px;
        margin-left: 2px;
      }
    }
  }
}
</style>
