<script setup>
import useLiveStream from "~/composables/data/liveStream"
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

const size = ref(props.size)
const reactiveData = toRef(props, "data")
// handle the click if this item is in the saved page and navigate to the live page
const handleClick = () => {
  navigateTo(`/live${reactiveData.value.slug ? `?slug=${reactiveData.value.slug}` : ""}`)
}
</script>

<template>
  <div v-if="reactiveData" class="live-item flex gap-3 md:gap-4">
    <VImage
      :src="reactiveData?.image"
      :ratio="[1, 1]"
      :alt="`${reactiveData?.showTitle} show poster image`"
      :size="{ xs: [112, 112], md: [240, 240] }"
      class="image flex-none w-7rem md:w-15rem"
      :srcset="[2]"
    />
    <div class="info flex flex-column gap-3 w-full justify-content-between">
      <div class="content flex flex-column justify-content-start w-full">
        <LiveBadge class="align-self-start" />
        <h1 class="truncate t2lines no-hyphens">
          {{ reactiveData?.title || reactiveData?.showTitle }}
        </h1>
        <HtmlConvert
          class="blurb truncate t3lines my-3"
          noBlocks
          :htmlContent="reactiveData?.onTodaysShowHeadline || reactiveData?.details"
          htmlClasses="line-height-4"
        />
        <PlayAndSkipButtons
          :hideSkip="true"
          :liveOnly="true"
          @beforeTogglePlay="togglePlayHere"
        />
      </div>
    </div>
  </div>

  <div v-else class="skeleton-holder flex gap-3">
    <div>
      <Skeleton :width="`${size}px`" :height="`${size}px`" borderRadius="0px" />
    </div>
    <div class="flex flex-column justify-content-center w-full gap-1">
      <Skeleton height="16px" width="50px" borderRadius="2px" />
      <Skeleton height="16px" width="150px" borderRadius="16px" />
      <div class="w-full flex flex-column gap-2 mt-1">
        <Skeleton height="13px" width="98%" borderRadius="16px" />
        <Skeleton height="13px" width="90%" borderRadius="16px" />
        <Skeleton height="13px" width="93%" borderRadius="16px" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
// .live-item {
//   .v-image-publisher.image {
//     flex: none;
//     width: v-bind(size);
//   }
// }
</style>
<style lang="scss">
.live-item {
  .v-image-publisher.image .image {
    background-color: #ffffff66;
  }
}
</style>
