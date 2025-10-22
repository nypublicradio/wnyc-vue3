<script setup>
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useIsApp,
  useIsEpisodePlaying,
  useAppDownloadLink,
} from "~/composables/states"
import { togglePlayEpisode } from "~/utilities/helpers"
import { updateLiveStream, updateAllLiveStreams } from "~/composables/data/liveStream"
const currentEpisodeHolder = useCurrentEpisodeHolder()
const isApp = useIsApp()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()
const isEpisodePlaying = useIsEpisodePlaying()
const appDownloadLink = useAppDownloadLink()

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
</script>

<template>
  <div class="live-feature">
    <!-- <pre>{{ currentEpisodeHolder }}</pre> -->
    <div class="holder">
      <!--    <VFlexibleLink raw to="/live" class="flex align-items-start"> -->
      <div class="flex align-items-center">
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
            class="flex flex-column gap-2 xl:gap-3 justify-content-center px-3"
          >
            <div class="hidden md:flex align-items-center gap-2">
              <LiveBadge fontSize="0.9rem" />
              <p
                v-if="currentEpisodeHolder.timeStart && currentEpisodeHolder.timeEnd"
                class="font-bold"
              >
                {{ currentEpisodeHolder.timeStart }} -
                {{ currentEpisodeHolder.timeEnd }}
              </p>
            </div>
            <h2 class="md:text-xl lg:text-2xl xl:text-4xl line-height-2 truncate t3lines">
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
            <div class="flex align-items-start justify-content-between">
              <div class="flex flex-row gap-3 flex-wrap md:flex-column">
                <PlayButton
                  :label="isEpisodePlaying ? listeningButtonLabel : defaultButtonLabel"
                  :data="currentEpisodeHolder"
                  @onClick="togglePlayHere"
                  severity="primary"
                  buttonClass="w-9rem md:w-13rem h-2rem justify-content-start"
                  labelClass="md:-ml-3"
                  live
                />
                <Button
                  v-if="!isApp"
                  label="Get the App"
                  severity="secondary"
                  class="hidden sm:flex p-button-sm xl:flex w-9rem md:w-13rem justify-content-start h-2rem p-button-center-label-with-icon"
                  @click="
                    navigateTo(appDownloadLink, {
                      external: appDownloadLink.startsWith('http') ? true : false,
                    })
                  "
                >
                  <template #icon>
                    <DevicesIcon />
                  </template>
                </Button>
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
              height="1.5rem"
              width="40%"
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
            <Skeleton class="mt-1 w-9rem lg:w-14rem" height="28px" borderRadius="16px" />
            <Skeleton
              class="mt-2 w-14rem hidden xl:block"
              height="28px"
              width="9rem"
              borderRadius="16px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
</style>

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
    .skeleton-holder {
      gap: 0.5rem;
    }
    .blurb {
      @include t4lines();
      @include media("<xl") {
        @include t2lines();
      }
    }
  }
}
@include media("<md") {
  .live-feature .holder {
    max-width: $contentWidth !important;
    margin: 0 auto;
    background-color: var(--p-content-background);
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
