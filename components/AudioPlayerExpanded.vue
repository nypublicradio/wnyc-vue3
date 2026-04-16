<script setup>
import {
  trackClickEvent,
  shareAPI,
  checkIsFavorited,
  addToFavorites2,
} from "~/utilities/helpers"
import {
  useCurrentEpisode,
  useCurrentUser,
  useIsLiveStream,
  useGlobalToast,
  useSleepTimerRunning,
  useIsApp,
} from "~/composables/states"
import { mediaTypeRoutes } from "~/composables/globals"
import useSleepTimer from "~/composables/useSleepTimer"
import { fetchAndStoreMp3, isAlreadyDownloaded } from "~/utilities/file-system"

import StarIcon from "~/components/icons/StarIcon.vue"
import DownloadIcon from "~/components/icons/DownloadIcon.vue"
import ShareIcon from "~/components/icons/ShareIcon.vue"
//import QueueIcon from "~/components/icons/QueueIcon.vue"
//import MoreEpisodesIcon from "~/components/icons/MoreEpisodesIcon.vue"
import FollowIcon from "~/components/icons/FollowIcon.vue"
import SleepIcon from "~/components/icons/SleepIcon.vue"

const globalToast = useGlobalToast()
const emit = defineEmits(["close-panel"])

const config = useRuntimeConfig()
const currentEpisode = useCurrentEpisode()
const user = useCurrentUser()
const isLiveStream = useIsLiveStream()
const sleepTimerRunning = useSleepTimerRunning()
const expandedFooterRef = ref(null)
const expandedFooterheight = ref(0)
const showShare = ref(true)
const isApp = useIsApp()

const { handleSleepTimer } = useSleepTimer()

const isFavorited = ref(false)
const isShowFollowed = ref(false)
const showDownload = ref(true)

// get true slug from id
const getTrueSlugFromId = async (id) => {
  try {
    const v2SlugRes = await $fetch(
      `${config.public.BFF_URL}/api/v2/show/${id}?slugOnly=true`
    ).catch((e) => {
      console.error(`Error getting true slug from id: ${e}`)
      return null
    })
    return v2SlugRes?.show?.slug
  } catch (error) {
    console.error(`Error getting true slug from id: ${error}`)
    return null
  }
}

onMounted(() => {
  watchEffect(async () => {
    // hide share if it is a segment, which is only set in NPR direct show episodes
    currentEpisode.value?.isSegment ? (showShare.value = false) : (showShare.value = true)
    isFavorited.value = await checkIsFavorited(
      currentEpisode.value?.meta?.slug || currentEpisode.value?.slug
    )

    const trueSlug = await getTrueSlugFromId(currentEpisode.value.showSlug)
    isShowFollowed.value = await checkIsFavorited(trueSlug)

    // show/hide download button based on show title
    const showsWithoutDownload = ["nyc now", "wnyc news"]
    const showTitle = (
      currentEpisode.value.showTitle || currentEpisode.value.title
    )?.toLowerCase()
    showDownload.value = showTitle
      ? !showsWithoutDownload.includes(showTitle) || !isApp.value
      : true
  })
})

onMounted(() => {
  if (expandedFooterheight.value)
    expandedFooterheight.value = `${expandedFooterRef.value.offsetHeight}px`
})

// add item to favorites
const handleAddToFavorites = () => {
  // helper func for adding to favorites, also handles account prompt if not logged in
  addToFavorites2({
    item: currentEpisode.value,
    isFavorited: isFavorited.value,
  })
  if (user.value) {
    isFavorited.value = !isFavorited.value
  }
}
// add show to favorites
const handleFollow = async (showSlug) => {
  try {
    // Step 1: Query v2 to explicitly resolve the slug (especially for UUIDs)
    const trueSlug = await getTrueSlugFromId(showSlug)

    let showData = null

    // Step 2: Only fetch wagtail if we successfully resolved a true slug from v2
    if (trueSlug) {
      showData = await $fetch(
        `${config.public.BFF_URL}/api/pages/wagtail/${trueSlug}?showOnly=true`
      ).catch((e) => null)
    }

    if (!showData) {
      console.warn("Unable to find the show properties.")
      globalToast.value = {
        severity: "warn",
        summary: "Unable to find the show to follow.",
        life: 3000,
      }
      return
    }
    addToFavorites2({
      item: showData,
      isFavorited: isShowFollowed.value,
      message: "Updated your followed shows.",
    })

    if (user.value) {
      isShowFollowed.value = !isShowFollowed.value
    }
  } catch (error) {
    console.error(`Error following this show: ${error}`)
    globalToast.value = {
      severity: "error",
      summary: `Error following this show ${error}`,
      life: 3000,
    }
  }
}
const progress = ref({})
// handle the download of the audio file request and feed the progress
const handleDownload = async () => {
  // update CapacitorJs filesystem
  trackClickEvent(
    "Click Tracking - Audio Download",
    "Expanded Audio Player",
    currentEpisode.value.title
  )
  progress.value[currentEpisode.value.id] = await fetchAndStoreMp3(currentEpisode.value)
}

// handle share button
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

// const handleMoreEpisodes = () => {
//   // navitget to show page
//   trackClickEvent(
//     "Click Tracking - More Episodes",
//     "Expanded Audio Player",
//     currentEpisode.value.title
//   )
// }

const isLive = computed(() => {
  return isLiveStream.value
})

// set the items for the Dot menu
const getDotMenuItems = () => {
  return [
    ...(isLive.value
      ? [
          {
            label: `${isShowFollowed.value ? "Unfollow" : "Follow"} ${
              currentEpisode.value.title
            }`,
            customIcon: FollowIcon,
            active: isShowFollowed.value,
            title: currentEpisode.value.title,
            command: () => {
              handleFollow(currentEpisode.value.showSlug)
            },
          },
          ...(isApp.value
            ? [
                {
                  label: "Sleep Timer",
                  customIcon: SleepIcon,
                  active: sleepTimerRunning.value,
                  title: currentEpisode.value.title,
                  command: () => {
                    handleSleepTimer()
                  },
                },
              ]
            : []),
          // ...(showShare.value
          //   ? [
          //       {
          //         label: "Share",
          //         customIcon: ShareIcon,
          //         title: currentEpisode.value.title,
          //         command: () => {
          //           handleShare()
          //         },
          //       },
          //     ]
          //   : []),
          // {
          //   label: "More Episodes",
          //   customIcon: MoreEpisodesIcon,
          //   title: currentEpisode.value.title,
          //   command: () => {
          //     handleMoreEpisodes()
          //   },
          // },
        ]
      : [
          ...(!currentEpisode.value.hideFavorite
            ? [
                {
                  label: `${
                    isFavorited.value ? "Unfavorite Episode" : "Favorite Episode"
                  }`,
                  customIcon: StarIcon,
                  active: isFavorited.value,
                  title: currentEpisode.value.title,
                  command: () => {
                    handleAddToFavorites()
                  },
                },
              ]
            : []),
          ...(isApp.value
            ? [
                {
                  label: "Sleep Timer",
                  customIcon: SleepIcon,
                  active: sleepTimerRunning.value,
                  title: currentEpisode.value.title,
                  command: () => {
                    handleSleepTimer()
                  },
                },
              ]
            : []),
          ...(showDownload.value
            ? [
                {
                  label: "Download",
                  customIcon: DownloadIcon,
                  title: currentEpisode.value.title,
                  command: () => {
                    handleDownload()
                  },
                },
              ]
            : []),
          ...(showShare.value
            ? [
                {
                  label: "Share",
                  customIcon: ShareIcon,
                  title: currentEpisode.value.title,
                  command: () => {
                    handleShare()
                  },
                },
              ]
            : []),
          // {
          //   label: "Add to Queue",
          //   active: true,
          //   customIcon: QueueIcon,
          //   title: currentEpisode.value.title,
          //   command: () => {
          //     handleAddToQueue()
          //   },
          // },
          // {
          //   label: "More Episodes",
          //   customIcon: MoreEpisodesIcon,
          //   title: currentEpisode.value.title,
          //   command: () => {
          //     handleMoreEpisodes()
          //   },
          // },
          // {
          //   label: `Follow ${currentEpisode.value.showTitle}`,
          //   customIcon: FollowIcon,
          //   active: isFavorited.value,
          //   title: currentEpisode.value.title,
          //   command: () => {
          //     handleAddToFavorites()
          //   },
          // },
        ]),
  ]
}

// fire the command located in the menuItems data object above when the user clicks on the menu item
const onMenuChange = (e) => {
  e?.value?.command()
}

// handles the click on the bottom fixed footer
const moreFromClick = async () => {
  const title = currentEpisode.value.showTitle || currentEpisode.value.title
  const slug =
    currentEpisode.value.showSlug ||
    currentEpisode.value.meta?.showSlug ||
    currentEpisode.value.showId ||
    currentEpisode.value.show
  let finalSlug = slug
  // detect if the slug is a uuid
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    slug
  )
  if (isUuid) {
    try {
      const showSlug = await $fetch(
        `${config.public.BFF_URL}/api/v2/show/${slug}?slugOnly=true`
      )
      finalSlug = showSlug.show.slug
    } catch (error) {
      globalToast.value = {
        severity: "error",
        summary: "We are having a problem loading the show page. Please try again later.",
        life: 6000,
        closable: true,
      }
      console.error(`Error fetching show details in moreFromClick: ${error}`)
      return
    }
  }
  trackClickEvent(
    `Click Tracking - Expanded Audio Player More from ${title}`,
    "Expanded Audio Player",
    title
  )
  emit("close-panel")
  navigateTo(`${mediaTypeRoutes.show}${finalSlug}`)
}
</script>

<template>
  <section class="expanded-player flex flex-column gap-3">
    <!-- <pre class="text-xs">{{ currentEpisode }}</pre> -->
    <div class="tools flex justify-content-between">
      <div v-if="isLive && isApp" class="flex gap-3">
        <SleepTimerButton @emit-click="handleSleepTimer" :isActive="sleepTimerRunning" />
      </div>
      <div v-else class="flex gap-3">
        <Button
          text
          severity="secondary"
          rounded
          aria-label="add to favorites"
          @click="handleAddToFavorites"
          v-if="!currentEpisode.hideFavorite && !isLive"
        >
          <template #icon>
            <StarIcon :active="isFavorited" />
          </template>
        </Button>
        <SleepTimerButton
          v-if="isApp"
          @emit-click="handleSleepTimer"
          :isActive="sleepTimerRunning"
        />
        <Button
          text
          severity="secondary"
          rounded
          aria-label="download"
          @click="handleDownload"
          v-if="currentEpisode.hideFavorite && showDownload"
        >
          <template #icon>
            <DownloadIcon />
          </template>
        </Button>
        <DownloadProgress
          v-if="progress[currentEpisode.id] || isAlreadyDownloaded(currentEpisode)"
          class="flex align-items-center"
          :isDownloaded="isAlreadyDownloaded(currentEpisode)"
          :progress="progress[currentEpisode.id]"
        />
      </div>

      <div class="flex gap-1">
        <Button
          v-if="showShare && !isLive"
          text
          severity="secondary"
          rounded
          aria-label="share"
          @click="handleShare"
        >
          <template #icon>
            <ShareIcon />
          </template>
        </Button>
        {{ isShowFollowed }}
        <DotMenu
          :menuItems="getDotMenuItems()"
          size="large"
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
              <div class="flex gap-3 align-items-center px-4">
                <VImage
                  :src="currentEpisode.image"
                  :alt="`${currentEpisode.title} show image`"
                  :size="{ xs: [60, 60] }"
                  class="show-image-in-menu flex-none"
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
      v-if="
        !!currentEpisode.onTodaysShowImageTemplate
          ? false
          : currentEpisode.player_image !== currentEpisode.image
      "
      :src="currentEpisode.image || currentEpisode.image.template"
      :alt="`${currentEpisode.title} featured image`"
      :size="{
        xs: [327, 218],
        sm: [528, 352],
        md: [672, 448],
        lg: [896, 597],
        xl: [1104, 736],
        xxl: [1344, 896],
      }"
      class="card-feature-image"
    >
      <template #caption>
        <VImageCaption
          v-if="currentEpisode.image.caption"
          :text="currentEpisode.image.caption"
          class="caption"
        />
      </template>
    </VImage>
    <HtmlConvert
      :htmlContent="currentEpisode.details"
      :key="`details-${currentEpisode.id || 'default'}`"
    />
    <VImage
      v-if="currentEpisode.onTodaysShowImageTemplate"
      :src="{ template: currentEpisode.onTodaysShowImageTemplate }"
      :alt="`${currentEpisode.title} featured image`"
      :size="{
        xs: [327, 218],
        sm: [528, 352],
        md: [672, 448],
        lg: [896, 597],
        xl: [1104, 736],
        xxl: [1344, 896],
      }"
      class="show-feature-image"
    >
      <template #caption>
        <VImageCaption
          v-if="currentEpisode.onTodaysShowImageCaption"
          :text="currentEpisode.onTodaysShowImageCaption"
          class="caption"
        />
      </template>
      <template #belowImage>
        <div class="text-xs mt-3">
          {{ currentEpisode.onTodaysShowImageCredits }}
        </div>
        <HtmlConvert
          :htmlContent="currentEpisode.episodeBody"
          class="caption text-sm mt-6"
          :key="`body-${currentEpisode.id || 'default'}`"
        />
      </template>
    </VImage>
    <div v-if="currentEpisode.onTodaysShowHosts" class="mt-3">
      <h2>Host{{ currentEpisode.onTodaysShowHosts.length > 1 ? "s" : "" }}</h2>
      <div class="flex gap-4 flex-wrap my-3">
        <Author
          v-for="author in currentEpisode.onTodaysShowHosts"
          :key="author.url"
          :imgSrc="author.image"
          :name="`${author.firstName} ${author.lastName}`"
          :to="
            (currentEpisode.cmsSource = 'publisher'
              ? author.url
              : author.url.replace('people', 'staff'))
          "
          @on-click="emit('close-panel')"
        />
      </div>
    </div>
    <div v-if="currentEpisode.episodeTranscript">
      <h2>Transcript</h2>
      <HtmlConvert
        :htmlContent="currentEpisode.episodeTranscript"
        :key="`transcript-${currentEpisode.id || 'default'}`"
      />
    </div>
    <div
      ref="expandedFooterRef"
      v-if="
        !isLiveStream &&
        (currentEpisode.showSlug || currentEpisode.meta?.showSlug || currentEpisode.show)
      "
      class="expanded-footer"
    >
      <section class="pb-2">
        <hr class="mb-2" />
        <Button
          text
          severity="secondary"
          :label="`More from ${currentEpisode.showTitle || currentEpisode.title}`"
          :aria-label="`More from ${
            currentEpisode.showTitle || currentEpisode.title
          } button`"
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
      max-width: $thinContentWidth;
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
        transition: bottom var(--p-transition-duration);
        -webkit-transition: bottom var(--p-transition-duration);
      }
    }

    &.expanded {
      &.browser {
        // fixes android chrome ignoring the top safe area
        padding-top: max(30px, env(safe-area-inset-top));
      }
      .expanded-footer {
        bottom: env(safe-area-inset-bottom);
      }
    }

    .template-blank {
      .expanded-footer {
        bottom: env(safe-area-inset-bottom) !important;
      }
    }

    .header-cast-btn {
      display: none;
    }

    &.app {
      &.expanded {
        .expanded-footer {
          bottom: calc($bottomMenuHeight + env(safe-area-inset-bottom));
        }
      }
    }
  }
}
</style>
