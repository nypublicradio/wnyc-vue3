<script setup>
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from "~/composables/states"
import { templatizePublisherImageUrl, togglePlayEpisode } from "~/utilities/helpers"
import { updateLiveStream, updateAllLiveStreams } from "~/composables/data/liveStream"
const currentEpisodeHolder = useCurrentEpisodeHolder()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

const defaultButtonLabel = "Listen Live"
const buttonLabel = ref(defaultButtonLabel)

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
    <div class="holder">
      <!--    <VFlexibleLink raw to="/live" class="flex align-items-start"> -->
      <div class="flex align-items-start">
        <div class="image-holder relative">
          <transition name="fade" mode="out-in">
            <VImage
              v-if="currentEpisodeHolder?.image"
              :src="templatizePublisherImageUrl(currentEpisodeHolder?.image)"
              :width="280"
              :height="280"
              :ratio="[1, 1]"
              alt="show poster image"
              class="image"
              :key="currentEpisodeHolder?.id"
            />
            <WnycLoader v-else class="image-loader-anim" size="1rem" bg spinner />
          </transition>
        </div>
        <div class="content w-full relative">
          <transition name="fade">
            <div
              v-if="currentEpisodeHolder"
              class="flex flex-column gap-2 lg:gap-3 justify-content-center px-3"
            >
              <div class="hidden md:flex align-items-center">
                <LiveBadge fontSize="0.9rem" class="-ml-2" />
                <p class="font-bold">
                  {{ currentEpisodeHolder.timeStart }} -
                  {{ currentEpisodeHolder.timeEnd }}
                </p>
              </div>
              <h2 class="md:text-xl lg:text-4xl">
                {{ currentEpisodeHolder?.title }}
              </h2>
              <div
                class="blurb truncate html-formating"
                v-html="
                  currentEpisodeHolder?.onTodaysShowHeadline ??
                  currentEpisodeHolder?.details
                "
              ></div>
              <div class="flex align-items-start justify-content-between">
                <div class="flex flex-column gap-3">
                  <PlayButton
                    :label="buttonLabel"
                    :data="currentEpisodeHolder"
                    @onClick="togglePlayHere"
                    severity="primary"
                    buttonClass="icon-wide"
                    labelClass="md:px-6"
                    live
                  />
                  <Button
                    label="Get the App"
                    severity="secondary"
                    class="p-button-sm icon-wide hidden xl:flex"
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
              class="skeleton-holder flex flex-column justify-content-center gap-2 lg:gap-3 w-full absolute px-3"
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
              <Skeleton
                class="mt-1 w-9rem lg:w-14rem"
                height="28px"
                borderRadius="16px"
              />
              <Skeleton
                class="mt-2 w-14rem hidden xl:block"
                height="28px"
                width="9rem"
                borderRadius="16px"
              />
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.live-feature {
  // for the buttons on the life feature in the home page. The Live button component and base Button component need some UGLY help to match
  .p-button {
    &.icon-wide {
      min-width: 140px;
      min-height: 34.16px;
      svg {
        height: 20px;
      }
      .devices-icon {
        margin-left: -16px;
        @include media("<md") {
          margin-left: 0;
        }
      }
      .icon {
        margin-left: 5px;
        @include media("<md") {
          margin-left: 0px;
          padding-right: 8px;
        }
      }
      .p-button-label {
        width: 150px;
        padding-right: 10px;
        @include media("<md") {
          width: auto;
        }
        text-align: center;
      }
      .content .center {
        padding-left: 2.5rem !important;
        padding-right: 3.5rem !important;
        @include media("<md") {
          padding-left: unset !important;
          padding-right: unset !important;
        }
      }
    }
  }
  .content {
    .blurb {
      * {
        line-height: 1.5rem !important;
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
      width: 116px;
      height: 116px;
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
        width: 116px;
        height: 116px;
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
