<script setup>
import { toRefs, computed } from "vue"
import FollowIcon from "~/components/icons/FollowIcon.vue"
import PlayIcon from "~/components/icons/PlayIcon.vue"

import {
  checkIsFavorited,
  togglePlayEpisode,
  hasAudio,
  addToFavorites2,
  getEpisodeFallBackImage,
} from "~/utilities/helpers"
import {
  useCurrentUser,
  useIsEpisodePlaying,
  useIsApp,
  useAppDownloadLink,
} from "~/composables/states"
import { mediaTypeRoutes, mediaTypes } from "~/composables/globals"
import useSleepTimer from "~/composables/useSleepTimer"

const props = defineProps({
  show: {
    type: Object,
    default: null,
  },
})

const { show } = toRefs(props)

//const emit = defineEmits(["change", "click"]);

// Computed properties derived from the show data
const showImage = computed(() => show.value?.show?.image)
const showTitle = computed(() => show.value?.show?.title)
const showTease = computed(() => show.value?.show?.tease)
const showScheduleSummary = computed(() => show.value?.show?.scheduleSummary)
const showSlug = computed(() => show.value?.show?.slug)

const route = useRoute()
const appDownloadLink = useAppDownloadLink()

// Reactive computed properties for episodes
const episodes = computed(() => show.value?.episodes?.data)
const hasEpisodes = computed(() => {
  return episodes.value?.some((ep) => ep?.type !== "segment")
})

const isApp = useIsApp()
const user = useCurrentUser()
const isEpisodePlaying = useIsEpisodePlaying()

const { handleSleepTimer, sleepTimerRunning } = useSleepTimer()

// if user is logged in, check if item is already favorited
const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(route.params.slug)
})

// finds first episode with audio to play
const firstEpisodeWithAudio = () => {
  return episodes.value.find((ep) => {
    if (hasAudio(ep.audio)) {
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
  // handle NPR show segments.
  if (show.value.show.cmsSource === "npr") {
    // route to the first episode with a url parameter
    navigateTo({
      path: `${mediaTypeRoutes[mediaTypes.EPISODE]}${show.value.episodes.data[0].id}`,
      query: {
        src: "npr",
        type: "episode",
        autoplay: true,
      },
    })
  } else {
    const ep = firstEpisodeWithAudio()
    togglePlayEpisode(ep)
  }
}

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: show.value.show,
    isFavorited: isFavorited.value,
    message: "Updated your followed shows.",
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}
</script>

<template>
  <div class="show-header flex justify-content-start gap-3 md:gap-5">
    <!-- <pre class="text-white">{{ show }}</pre> -->
    <VImage
      v-if="show"
      :src="showImage"
      :srcFallback="getEpisodeFallBackImage()"
      :alt="`${showTitle} show image`"
      :size="{ xs: [112, 112], md: [208, 208] }"
      class="flex-none show-image w-7rem md:w-13rem"
      :srcset="[2]"
    />
    <Skeleton
      v-else
      class="flex-none show-image w-7rem md:w-13rem h-7rem md:h-13rem"
      borderRadius="0px"
    />
    <div v-if="show" class="flex flex-column justify-content-start gap-3 mt-1 md:mt-2">
      <h2 class="line-height-1 text-2xl md:text-6xl">{{ showTitle }}</h2>
      <p v-if="showScheduleSummary" class="mt-0 md:-mt-3">
        {{ showScheduleSummary }}
      </p>
      <HtmlConvert
        v-if="showTease"
        no-blocks
        :htmlContent="showTease"
        :key="`tease-${showSlug}`"
        class="hidden md:block text-sm md:text-base"
      />
      <!-- desktop buttons -->
      <div class="hidden md:flex align-items-center gap-3">
        <Button
          class="play-btn flex-none"
          severity="secondary"
          rounded
          aria-label="play toggle"
          tabindex="0"
          :disabled="!hasEpisodes"
          @click="togglePlayMostRecentEpisode"
        >
          <template #icon>
            <PauseIcon v-if="isEpisodePlaying" />
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
            <FollowIcon :active="isFavorited" style="height: 20px; width: 20px" />
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
          class=""
          @click="
            navigateTo(appDownloadLink, {
              external: appDownloadLink.startsWith('http') ? true : false,
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
        <Skeleton class="my-2" height="48px" width="65%" borderRadius="24px" />
        <Skeleton
          v-if="showScheduleSummary"
          height="14px"
          width="35%"
          borderRadius="24px"
        />
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
      <template #icon> <FollowIcon :active="isFavorited" class="w-2rem mt-1" /></template>
    </Button>

    <Button
      class="play-btn flex-none"
      severity="secondary"
      rounded
      aria-label="play toggle"
      tabindex="0"
      :disabled="!hasEpisodes"
      @click="togglePlayMostRecentEpisode"
    >
      <template #icon>
        <PauseIcon v-if="isEpisodePlaying" />
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
  <div v-else class="flex md:hidden justify-content-center align-items-center gap-2 mt-3">
    <Skeleton height="37px" width="37px" borderRadius="20px" />
    <Skeleton height="48px" width="48px" borderRadius="24px" />
    <Skeleton height="37px" width="37px" borderRadius="20px" />
  </div>
</template>

<style lang="scss" scoped>
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
</style>
