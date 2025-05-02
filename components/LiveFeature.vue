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
  <div class="live-feature p-ripple" v-ripple>
    <section class="holder">
      <VFlexibleLink raw to="/live" class="flex align-items-center">
        <div class="image-holder relative">
          <transition name="fade" mode="out-in">
            <VImage
              v-if="currentEpisodeHolder?.image"
              :src="templatizePublisherImageUrl(currentEpisodeHolder?.image)"
              :width="116"
              :height="116"
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
              class="flex flex-column gap-2 justify-content-center p-3"
            >
              <h2>{{ currentEpisodeHolder?.title }}</h2>
              <div
                class="blurb truncate t2lines html-formating"
                v-html="
                  currentEpisodeHolder?.onTodaysShowHeadline ??
                  currentEpisodeHolder?.details
                "
              ></div>
              <div class="flex align-items-center justify-content-between">
                <PlayButton
                  :label="buttonLabel"
                  :data="currentEpisodeHolder"
                  @onClick="togglePlayHere"
                  severity="primary"
                  buttonClass="p-button-lg"
                  labelClass="md:pr-6 md:pl-5"
                  live
                />
                <BarsPlaying class="mx-2" :data="currentEpisodeHolder" />
              </div>
            </div>
            <div
              class="skeleton-holder flex flex-column justify-content-center w-full absolute p-3"
              v-else
            >
              <Skeleton
                height="20px"
                width="6rem"
                borderRadius="16px"
                style="margin-bottom: 6px"
              />
              <div class="w-full desc">
                <Skeleton
                  height="13px"
                  width="85%"
                  borderRadius="16px"
                  style="margin-bottom: 6px"
                />
                <Skeleton height="13px" width="90%" borderRadius="16px" />
              </div>
              <Skeleton height="28px" width="9rem" borderRadius="16px" />
            </div>
          </transition>
        </div>
      </VFlexibleLink>
    </section>
  </div>
</template>

<style lang="scss">
// removes extra tags from the blurb
.live-feature .content {
  .blurb {
    font-size: 13px;
    *:not(:first-child) {
      display: none;
    }
  }
}
</style>

<style lang="scss" scoped>
$container-breakpoint-xs: useBreakpointOrFallback("xs", 375px);
$container-breakpoint-md: useBreakpointOrFallback("md", 768px);
$container-breakpoint-lg: useBreakpointOrFallback("lg", 1024px);
.live-feature {
  container-type: inline-size;
  position: relative;
  //background-color: var(--live-feature-background);
  .image-holder {
    position: relative;
    flex: none;
    width: 116px;
    height: 116px;
    background-color: #ffffff99;
    .image,
    .image-loader-anim {
      width: 116px;
      height: 116px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .content {
    min-height: 116px;
    .skeleton-holder {
      gap: 0.5rem;
    }
  }
}
@container (min-width: #{$container-breakpoint-md}) {
  .live-feature .holder {
    max-width: $contentWidth !important;
    margin: 0 auto;
  }
}

@container (max-width: #{$container-breakpoint-xs}) {
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
      min-height: 90px;
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
