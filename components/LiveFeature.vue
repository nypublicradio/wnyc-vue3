<script setup>
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsApp,
  useIsEpisodePlaying,
  useIsLiveStream,
  useAppDownloadLink,
  useAllCurrentStations,
} from "~/composables/states"
import {
  togglePlayEpisode,
  initializeStationList,
  getOrg,
  formatTime,
} from "~/utilities/helpers"
import useLiveStream, {
  updateLiveStream,
  updateAllLiveStreams,
} from "~/composables/data/liveStream"
const { getStationBySlugAndPlayIt, formatAndRoundTime } = useLiveStream()
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isApp = useIsApp()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const isLiveStream = useIsLiveStream()
const appDownloadLink = useAppDownloadLink()
const allCurrentStations = useAllCurrentStations()
const defaultButtonLabel = "Listen Live"
const listeningButtonLabel = "Listening Live"

// handles play button click that updates the currentEpisode and isEpisodePlaying states
const togglePlayHere = async () => {
  if (
    currentEpisode.value?.slug !== currentEpisodeHolder.value?.slug ||
    currentEpisode.value?.timeStart !== currentEpisodeHolder.value?.timeStart
  ) {
    togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
  } else {
    togglePlayTrigger.value = !togglePlayTrigger.value
  }
  // updates the stream to the current station
  if (currentEpisode.value) {
    await updateLiveStream(currentEpisode.value.slug, false)
  } else {
    await updateAllLiveStreams()
  }
}
// when selecting the options in the All Streams drop down button
const onUpdateStation = (station) => {
  getStationBySlugAndPlayIt(station.slug, isEpisodePlaying.value)
}
</script>

<template>
  <div class="live-feature">
    <div class="holder overflow-hidden">
      <VFlexibleLink
        raw
        to="/live"
        v-ripple
        class="card-click w-full h-full absolute top-0 left-0 z-1 p-ripple"
        tabindex="0"
        aria-role="button"
      ></VFlexibleLink>
      <div class="flex align-items-center z-2">
        <div class="image-holder relative">
          <Transition name="fade" mode="out-in">
            <VImage
              v-if="currentEpisodeHolder?.image"
              :size="{ xs: [138, 138], sm: [172, 172], xl: [280, 280] }"
              :src="currentEpisodeHolder?.image"
              alt="show poster image"
              class="image"
              :key="currentEpisodeHolder?.id"
              loading="eager"
            />
            <WnycLoader v-else class="image-loader-anim" size="1rem" bg spinner />
          </Transition>
        </div>
        <div class="content w-full relative">
          <div
            v-if="currentEpisodeHolder"
            class="flex flex-column gap-1 xl:gap-3 justify-content-center px-3"
          >
            <div
              class="indicator-schedule flex align-items-center gap-1 md:gap-2 flex-wrap"
            >
              <LiveBadge />
              <div class="schedule-text flex gap-1">
                <p class="font-bold" v-if="currentEpisodeHolder?.cmsSource">
                  {{ getOrg(currentEpisodeHolder) }}
                </p>
                <p
                  class="font-bold"
                  v-if="
                    currentEpisodeHolder?.cmsSource &&
                    currentEpisodeHolder.timeStart &&
                    currentEpisodeHolder.timeEnd
                  "
                >
                  |
                </p>
                <p
                  v-if="currentEpisodeHolder.timeStart && currentEpisodeHolder.timeEnd"
                  class="font-bold"
                >
                  {{ formatAndRoundTime(currentEpisodeHolder.timeStart) }} -
                  {{ formatAndRoundTime(currentEpisodeHolder.timeEnd) }}
                </p>
              </div>
            </div>
            <h2 class="md:text-xl lg:text-2xl xl:text-4xl line-height-2 truncate t2lines">
              {{ currentEpisodeHolder?.title }}
            </h2>
            <div
              v-if="
                currentEpisodeHolder?.onTodaysShowHeadline ||
                currentEpisodeHolder?.details
              "
              class="blurb truncate html-formatting"
              v-html="
                currentEpisodeHolder?.onTodaysShowHeadline ??
                currentEpisodeHolder?.details
              "
            ></div>
            <div class="flex align-items-start justify-content-start mt-1 gap-0 md:gap-2">
              <div class="flex flex-row gap-3 flex-wrap md:flex-column">
                <PlayButton
                  :label="
                    isEpisodePlaying && isLiveStream
                      ? listeningButtonLabel
                      : defaultButtonLabel
                  "
                  :data="currentEpisodeHolder"
                  @onClick="togglePlayHere"
                  severity="primary"
                  buttonClass="w-9rem md:w-21rem h-2rem justify-content-start"
                  labelClass="md:-ml-3"
                  live
                  class="z-2"
                />
                <div v-if="!isApp" class="hidden md:flex flex-row gap-3 flex-wrap">
                  <Button
                    label="Get the App"
                    severity="secondary"
                    class="p-button-sm flex w-10rem justify-content-start h-2rem p-button-center-label-with-icon z-2"
                    @click.prevent="
                      navigateTo(appDownloadLink, {
                        external: appDownloadLink.startsWith('http') ? true : false,
                      })
                    "
                  >
                    <template #icon>
                      <DevicesIcon />
                    </template>
                  </Button>
                  <!-- :menuItems="
                      getDotMenuItems(headerNavigationData[0].items[0])
                    " -->
                  <DotMenu
                    :menuItems="initializeStationList(allCurrentStations)"
                    label=""
                    class="z-2"
                    showTitle
                    checkMark
                    :initSelectedData="currentEpisodeHolder?.station"
                    contentClassPopover="max-w-17rem"
                    @change-emit="onUpdateStation"
                  >
                    <template #myCustomButton>
                      <Button
                        label="All Streams"
                        severity="secondary"
                        class="p-button-sm flex w-10rem justify-content-start h-2rem p-button-center-label-with-icon"
                        @click.prevent=""
                      >
                        <template #icon>
                          <i
                            class="pi pi-ellipsis-v"
                            style="
                              font-size: 0.85rem;
                              padding-left: 0.25rem;
                              padding-right: 0.25rem;
                            "
                          ></i>
                        </template>
                      </Button>
                    </template>
                  </DotMenu>
                </div>
              </div>
              <BarsPlaying class="mx-2 mt-2" :data="currentEpisodeHolder" />
            </div>
          </div>
          <div
            v-else
            class="skeleton-holder flex flex-column justify-content-center gap-2 lg:gap-3 w-full px-3 mt-1"
          >
            <Skeleton
              class="hidden md:block mb-2 mt-1"
              height="0.75rem"
              width="40%"
              borderRadius="16px"
            />
            <Skeleton
              class="hidden lg:block"
              height="2rem"
              width="60%"
              borderRadius="16px"
            />
            <Skeleton
              class="hidden md:block lg:hidden"
              height="1.2rem"
              width="40%"
              borderRadius="16px"
            />
            <Skeleton
              class="md:hidden"
              height="1rem"
              width="40%"
              borderRadius="16px"
              style="min-width: 120px !important"
            />
            <div class="w-full desc flex-column gap-2 hidden xs:flex">
              <Skeleton height="1rem" width="85%" borderRadius="16px" />
              <Skeleton height="1rem" width="90%" borderRadius="16px" />
              <Skeleton
                class="hidden xl:block"
                height="1rem"
                width="90%"
                borderRadius="16px"
              />
            </div>
            <Skeleton class="w-9rem md:w-21rem" height="28px" borderRadius="16px" />
            <div class="hidden md:flex flex-row gap-3 mt-1 lg:-mt-1">
              <Skeleton class="w-10rem" height="28px" width="9rem" borderRadius="16px" />
              <Skeleton class="w-10rem" height="28px" width="9rem" borderRadius="16px" />
            </div>
          </div>
        </div>
      </div>
      <!-- </VFlexibleLink> -->
    </div>
  </div>
</template>

<!-- <style lang="scss">
.live-feature {
  .content {
    .blurb {
      * {
        line-height: 1.25rem !important;
        margin-block-start: 0em;
        margin-block-end: 0em;
      }
      // removes extra tags from the blurb
      *:not(:first-child) {
        display: none;
      }
    }
  }
}
</style> -->

<style lang="scss" scoped>
// $container-breakpoint-xs: useBreakpointOrFallback("xs", 375px);
// $container-breakpoint-md: useBreakpointOrFallback("md", 768px);
// $container-breakpoint-lg: useBreakpointOrFallback("lg", 992px);
.live-feature {
  container-type: inline-size;
  position: relative;
  //background-color: var(--live-feature-background);
  .image-holder {
    position: relative;
    flex: none;
    width: 280px;
    height: 280px;
    @include media("<xl") {
      width: 172px;
      height: 172px;
    }
    @include media("<md") {
      width: 138px;
      height: 138px;
    }
    background-color: #ffffff99;
    .image,
    .image-loader-anim {
      width: 280px;
      height: 280px;
      @include media("<xl") {
        width: 172px;
        height: 172px;
      }
      @include media("<md") {
        width: 138px;
        height: 138px;
      }
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .content {
    .indicator-schedule {
      .live-badge {
        font-size: 0.9rem;
        @include media("<xl") {
          font-size: 0.8rem;
        }
        @include media("<lg") {
          font-size: 0.7rem;
        }
        @include media("<md") {
          margin-left: -4px;
          padding: 1px 4px 1px 4px !important;
          font-size: 0.65rem;
        }
      }
      .schedule-text * {
        @include media("<xl") {
          font-size: 0.9rem;
        }
        @include media("<lg") {
          font-size: 0.8rem;
        }
        @include media("<md") {
          font-size: 0.7rem;
        }
      }
    }
    .skeleton-holder {
      gap: 0.5rem;
    }
    .blurb {
      @include t3lines();
      @include media("<xl") {
        @include t2lines();
      }
      @include media("<md") {
        @include t2lines();
      }
      @include media("<lg") {
        font-size: 0.875rem;
      }
    }
  }
}
@include media("<md") {
  .live-feature {
    .holder {
      max-width: $contentWidth !important;
      margin: 0 auto;
    }
  }
}

@include media("<xs") {
  .live-feature {
    .image-holder {
      flex: none;
      width: 90px;
      height: 90px;
      .image,
      .image-loader-anim {
        width: 90px;
        height: 90px;
      }
    }
    .content {
      .blurb {
        display: none;
      }
      .skeleton-holder {
        .desc {
          display: none;
        }
      }
    }
  }
}
</style>
