<script setup>
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
import VFlexibleLink from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue"
import {
  useTogglePlayTrigger,
  useCurrentEpisode,
  useCurrentEpisodeHolder,
} from "~/composables/states"
import { templatizePublisherImageUrl, togglePlayEpisode } from "~/utilities/helpers"

// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

const currentEpisodeHolder = useCurrentEpisodeHolder()
const togglePlayTrigger = useTogglePlayTrigger()
const currentEpisode = useCurrentEpisode()

// handles play button click that updates the currentEpisode and isEpisodePlaying states
const togglePlayHere = () => {
  if (
    currentEpisode.value?.slug !== currentEpisodeHolder.value?.slug ||
    currentEpisode.value?.timeStart !== currentEpisodeHolder.value?.timeStart
  ) {
    togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
  } else {
    togglePlayTrigger.value = !togglePlayTrigger.value
  }
}
</script>

<template>
  <div class="live-feature p-ripple" v-ripple>
    <div class="holder">
      <VFlexibleLink raw to="/live" class="flex align-items-center">
        <div class="image-holder">
          <transition name="fade" mode="out-in">
            <VImage
              v-if="currentEpisodeHolder?.image"
              :src="templatizePublisherImageUrl(currentEpisodeHolder?.image)"
              :width="138"
              :height="138"
              :ratio="[1, 1]"
              alt="show poster image"
              class="image"
              :key="currentEpisodeHolder?.id"
            />
            <WnycLoader v-else class="image-loader-anim" size="2rem" bg spinner />
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
                  :label="currentEpisodeHolder?.station"
                  live
                  :data="currentEpisodeHolder"
                  @onClick="togglePlayHere"
                />
                <BarsPlaying class="mr-2" :data="currentEpisodeHolder" />
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
    </div>
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
.live-feature {
  container-type: inline-size;
  position: relative;
  background-color: var(--live-feature-background);

  .image-holder {
    position: relative;
    flex: none;
    width: 138px;
    height: 138px;
    //background-color: #ffffff;
    .image,
    .image-loader-anim {
      width: 138px;
      height: 138px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
  .content {
    min-height: 138px;
    .skeleton-holder {
      gap: 0.5rem;
    }
  }
}
@container (min-width: #{$container-breakpoint-md}) {
  .live-feature .holder {
    max-width: 668px !important;
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
