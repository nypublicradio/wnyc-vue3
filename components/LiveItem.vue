<script setup>
import useLiveStream from "~/composables/data/liveStream"
import { formatTime } from "~/utilities/helpers"
const { togglePlayHere } = useLiveStream()
const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  size: {
    type: Number,
    default: 112,
  },
  saved: {
    type: Boolean,
    default: false,
  },
})

const reactiveData = toRef(props, "data")

const startEndTime = computed(() => {
  if (!reactiveData.value || !reactiveData.value.showSchedule) return ""
  const startTime = formatTime(reactiveData.value?.showSchedule?.isoStartTime, "h:mma")
    .replace(":00", "")
    .toLowerCase()
  const endTime = formatTime(reactiveData.value?.showSchedule?.isoEndTime, "h:mma")
    .replace(":00", "")
    .toLowerCase()
  return `${startTime}-${endTime}`
})
</script>

<template>
  <div v-if="reactiveData" class="live-item">
    <div class="flex gap-3 md:gap-4">
      <VImage
        :src="reactiveData?.image"
        :ratio="[1, 1]"
        :alt="`${reactiveData?.showTitle} show poster image`"
        :size="{ xs: [112, 112], md: [240, 240], lg: [320, 320] }"
        class="image flex-none w-7rem md:w-15rem lg:w-20rem"
        :srcset="[2]"
      />
      <div class="info flex flex-column gap-3 w-full justify-content-between">
        <div class="content flex flex-column justify-content-start w-full">
          <div class="flex gap-2 align-items-center">
            <LiveBadge class="text-xxs md:text-base md:line-height-2" />
            <p>{{ startEndTime }}</p>
          </div>
          <h1 class="truncate t2lines no-hyphens">
            {{ reactiveData?.title || reactiveData?.showTitle }}
          </h1>
          <HtmlConvert
            class="blurb truncate t3lines my-3"
            noBlocks
            :htmlContent="reactiveData?.onTodaysShowHeadline || reactiveData?.details"
            htmlClasses="line-height-4"
          />
          <div class="hidden md:flex">
            <PlayAndSkipButtons
              :hideSkip="true"
              :liveOnly="true"
              @beforeTogglePlay="togglePlayHere"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="block md:hidden">
      <PlayAndSkipButtons
        :hideSkip="true"
        :liveOnly="true"
        @beforeTogglePlay="togglePlayHere"
      />
    </div>
  </div>

  <div v-else class="skeleton-holder flex gap-4">
    <div>
      <Skeleton
        class="w-7rem h-7rem md:w-15rem md:h-15rem lg:w-20rem lg:h-20rem"
        borderRadius="0px"
      />
    </div>
    <div class="flex flex-column justify-content-start w-full gap-2 md:gap-3">
      <div class="flex align-items-center gap-2">
        <Skeleton borderRadius="2px" class="w-3rem md:w-5rem md:h-2rem" />
        <Skeleton class="max-w-7rem" borderRadius="16px" />
      </div>
      <Skeleton class="max-w-20rem md:max-w-25rem h-2rem md:h-3rem" borderRadius="16px" />
      <div class="max-w-full flex flex-column gap-2 md:gap-3 mt-3">
        <Skeleton height="13px" width="98%" borderRadius="16px" />
        <Skeleton height="13px" width="90%" borderRadius="16px" />
        <Skeleton height="13px" width="93%" borderRadius="16px" />
        <Skeleton
          class="hidden md:block"
          height="55px"
          width="55px"
          borderRadius="28px"
        />
      </div>
    </div>
  </div>
  <Skeleton
    v-if="!reactiveData"
    class="block md:hidden m-auto mt-4"
    height="55px"
    width="55px"
    borderRadius="28px"
  />
</template>

<style lang="scss">
.live-item {
  .v-image-publisher.image .image {
    background-color: #ffffff66;
  }
}
</style>
