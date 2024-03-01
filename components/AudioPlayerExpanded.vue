<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import VImageCaption from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageCaption.vue"

import {
  trackClickEvent,
  shareAPI,
  templatizePublisherImageUrl,
  deleteFavorite,
  saveFavorite,
  checkIsFavorited,
  getFavoritedItems,
} from "~/utilities/helpers"
import {
  useCurrentEpisode,
  useCurrentUser,
  useAccountPromptSideBar,
  useIsLiveStream,
} from "~/composables/states"
import { useToast } from "primevue/usetoast"

import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
//import QueueIcon from "~/components/icons/QueueIcon.vue"
import MoreEpisodesIcon from "~/components/icons/MoreEpisodesIcon.vue"
import FollowIcon from "~/components/icons/FollowIcon.vue"
import SleepIcon from "~/components/icons/SleepIcon.vue"

const toast = useToast()

const emit = defineEmits(["close-panel"])

const currentEpisode = useCurrentEpisode()
const user = useCurrentUser()
const isLiveStream = useIsLiveStream()

const accountPromptSideBar = useAccountPromptSideBar()
const expandedFooterRef = ref(null)
const expandedFooterheight = ref(0)

const isFavorited = ref(false)
watchEffect(async () => {
  isFavorited.value = await checkIsFavorited(currentEpisode.value.slug)
})

onMounted(() => {
  if (expandedFooterheight.value)
    expandedFooterheight.value = `${expandedFooterRef.value.offsetHeight}px`
})

const handleAddToFavorites = async () => {
  if (user.value) {
    if (isFavorited.value) {
      await deleteFavorite(currentEpisode.value)
      getFavoritedItems()
      isFavorited.value = false
    } else {
      await saveFavorite(currentEpisode.value, currentEpisode.value.type)
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
      "Expanded Audio Player",
      currentEpisode.value.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}
// handle the download of the audio file request and feed the progress
const handleDownload = () => {
  // update CapacitorJs filesystem
  fetchAndStoreMp3(currentEpisode.value)
  trackClickEvent(
    "Click Tracking - Audio Download",
    "Expanded Audio Player",
    currentEpisode.value.title
  )
}

const handleShare = () => {
  shareAPI(currentEpisode.value, "Expanded Audio Player")
}

// const handleAddToQueue = () => {
//   // toggle active state
//   // update SB and LS with new state
//   trackClickEvent(
//     "Click Tracking - Add to Queue",
//     "Expanded Audio Player",
//     currentEpisode.value.title
//   )
// }

const handleMoreEpisodes = () => {
  // navitget to show page
  trackClickEvent(
    "Click Tracking - More Episodes",
    "Expanded Audio Player",
    currentEpisode.value.title
  )
}

const handleFollow = () => {
  // toggle active state
  // update SB and LS with new state
  trackClickEvent(
    `Click Tracking - Follow ${currentEpisode.value.title}`,
    "Expanded Audio Player",
    currentEpisode.value.title
  )
}

const handleSleepTimer = () => {
  // toggle active state
  // show sleep timer interface
  trackClickEvent(
    "Click Tracking - Sleep Timer",
    "Expanded Audio Player",
    currentEpisode.value.title
  )
}

const isLive = computed(() => {
  return isLiveStream.value
})

// set the items for the Dot menu
const getDotMenuItems = () => {
  return [
    ...(isLive.value
      ? [
          {
            label: `Follow ${currentEpisode.value.title}`,
            customIcon: FollowIcon,
            active: true,
            title: currentEpisode.value.title,
            command: () => {
              handleFollow()
            },
          },
          {
            label: "Sleep Timer",
            customIcon: SleepIcon,
            active: true,
            title: currentEpisode.value.title,
            command: () => {
              handleSleepTimer()
            },
          },
          {
            label: "Share",
            customIcon: ShareIcon,
            title: currentEpisode.value.title,
            command: () => {
              handleShare()
            },
          },
          {
            label: "More Episodes",
            customIcon: MoreEpisodesIcon,
            title: currentEpisode.value.title,
            command: () => {
              handleMoreEpisodes()
            },
          },
        ]
      : [
          ...(!currentEpisode.value.hideFavorite
            ? [
                {
                  label: "Favorite Episode",
                  customIcon: StarIcon,
                  active: isFavorited.value,
                  title: currentEpisode.value.title,
                  command: () => {
                    handleAddToFavorites()
                  },
                },
              ]
            : []),
          {
            label: "Download",
            customIcon: DownloadIcon,
            title: currentEpisode.value.title,
            command: () => {
              handleDownload()
            },
          },
          {
            label: "Share",
            customIcon: ShareIcon,
            title: currentEpisode.value.title,
            command: () => {
              handleShare()
            },
          },
          // {
          //   label: "Add to Queue",
          //   active: true,
          //   customIcon: QueueIcon,
          //   title: currentEpisode.value.title,
          //   command: () => {
          //     handleAddToQueue()
          //   },
          // },
          {
            label: "More Episodes",
            customIcon: MoreEpisodesIcon,
            title: currentEpisode.value.title,
            command: () => {
              handleMoreEpisodes()
            },
          },
          {
            label: `Follow ${currentEpisode.value.title}`,
            customIcon: FollowIcon,
            active: true,
            title: currentEpisode.value.title,
            command: () => {
              handleFollow()
            },
          },
        ]),
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e.value.command()
}

// handles the click on the bottom fixed footer
const moreFromClick = () => {
  trackClickEvent(
    `Click Tracking - Expanded Audio Player More from ${
      currentEpisode.value.showTitle || currentEpisode.value.title
    }`,
    "Expanded Audio Player",
    currentEpisode.title
  )
  emit("close-panel")
  navigateTo(`/browse/shows/${currentEpisode.value.show}`)
}
</script>

<template>
  <section class="expanded-player flex flex-column gap-3">
    <!--   <pre class="text-xs">{{ currentEpisode }}</pre> -->
    <div class="tools flex justify-content-between">
      <div v-if="isLive" class="flex gap-3">
        <Button text severity="secondary" rounded @click="handleFollow">
          <template #icon> <FollowIcon /></template>
        </Button>
        <Button text severity="secondary" rounded @click="handleSleepTimer">
          <template #icon> <SleepIcon /></template>
        </Button>
      </div>
      <div v-else class="flex gap-3">
        <Button
          text
          severity="secondary"
          rounded
          @click="handleAddToFavorites"
          v-if="!currentEpisode.hideFavorite"
        >
          <template #icon> <StarIcon :active="isFavorited" /></template>
        </Button>
        <Button text severity="secondary" rounded @click="handleDownload">
          <template #icon> <DownloadIcon /></template>
        </Button>
      </div>

      <div class="flex gap-1">
        <Button text severity="secondary" rounded @click="handleShare">
          <template #icon> <ShareIcon /></template>
        </Button>

        <DotMenu
          :menuItems="getDotMenuItems()"
          size="large"
          width="37px"
          height="37px"
          class="-mr-2"
          @changeEmit="onMenuChange"
        >
          <template #end v-if="currentEpisode.embedCode">
            <div class="p-0">
              <Textarea
                disabled
                class="w-full text-xs mt-2"
                v-model="currentEpisode.embedCode"
                rows="9"
              />
            </div>
          </template>
          <template #header-bottom>
            <div>
              <div class="flex gap-3 px-4 align-items-center">
                <VImage
                  :src="templatizePublisherImageUrl(currentEpisode.image)"
                  :alt="`${currentEpisode.title} show image`"
                  :width="116"
                  :height="116"
                  :sizes="[2]"
                  class="show-image-in-menu"
                  :ratio="[1, 1]"
                  style="height: 60px; width: 60px"
                />

                <div class="info">
                  <h2>{{ currentEpisode.title }}</h2>
                  <p v-if="isLive">{{ currentEpisode.station }}</p>
                  <p v-else>{{ currentEpisode.show }}</p>
                </div>
              </div>
              <hr class="mt-5 mb-2 dim" />
            </div>
          </template>
        </DotMenu>
      </div>
    </div>

    <VImage
      v-if="currentEpisode.onTodaysShowImageTemplate"
      :src="currentEpisode.onTodaysShowImageTemplate"
      :alt="`${currentEpisode.title} featured image`"
      :width="421"
      :height="275"
      :sizes="[2]"
      class="show-feature-image"
    >
      <template #caption>
        <VImageCaption :text="currentEpisode.onTodaysShowImageCaption" class="caption" />
      </template>
      <template #belowImage>
        <div class="text-xs mt-2">
          {{ currentEpisode.onTodaysShowImageCredits }}
        </div>
        <div
          class="caption text-sm mt-2 html-formatting"
          v-html="currentEpisode.episodeBody"
        />
      </template>
    </VImage>

    <div v-if="currentEpisode.onTodaysShowHosts" class="mt-3">
      <h2>Author{{ currentEpisode.onTodaysShowHosts.length > 1 ? "s" : "" }}</h2>
      <div class="flex gap-4 flex-wrap my-3">
        <Author
          v-for="author in currentEpisode.onTodaysShowHosts"
          :key="author.url"
          :imgSrc="author.image"
          :name="`${author.firstName} ${author.lastName}`"
          :to="author.url"
          @on-click="emit('close-panel')"
        />
      </div>
    </div>
    <div v-if="currentEpisode.episodeTranscript">
      <h2>Transcript</h2>
      <div v-html="currentEpisode.episodeTranscript" class="html-formatting"></div>
    </div>

    <div ref="expandedFooterRef" v-if="currentEpisode.slug" class="expanded-footer">
      <section class="pb-2">
        <hr class="mb-2" />
        <Button
          text
          severity="secondary"
          :label="`More from ${currentEpisode.showTitle || currentEpisode.title}`"
          icon="pi pi-chevron-right"
          iconPos="right"
          class="flex m-auto"
          @click="moreFromClick"
        />
      </section>
    </div>
  </section>
</template>

<style lang="scss">
:root {
  $expandedFooterHeight: 100px;
  .persistent-player {
    .expanded-player {
      padding-bottom: calc(
        $bottomMenuHeight + $expandedFooterHeight + env(safe-area-inset-bottom) + 2rem
      );
      .expanded-footer {
        background: var(--persistent-player-bg);

        display: block;
        position: fixed;
        //height: 45px;
        bottom: 0;
        left: 0;
        width: 100%;
        transition: bottom $transitionDuration;
        -webkit-transition: bottom $transitionDuration;
      }

      .tools {
      }
    }
    &.expanded {
      .expanded-footer {
        bottom: calc($bottomMenuHeight + env(safe-area-inset-bottom));
      }
    }
    .template-blank {
      .expanded-footer {
        bottom: env(safe-area-inset-bottom) !important;
      }
    }
  }
}
</style>
