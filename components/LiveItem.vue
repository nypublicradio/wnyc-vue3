<script setup>
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
  if (props.saved) {
    navigateTo(
      `/live${reactiveData.value.slug ? `?slug=${reactiveData.value.slug}` : ""}`
    )
  }
}
</script>

<template>
  <div
    v-if="reactiveData"
    class="live-item flex gap-3"
    @click="handleClick"
    :class="[{ 'cursor-pointer': props.saved }]"
  >
    <VImage
      v-if="reactiveData?.image"
      :src="reactiveData?.image"
      :width="size"
      :height="size"
      :ratio="[1, 1]"
      alt="show poster image"
      class="image"
    />
    <div class="info flex flex-column gap-3 w-full justify-content-between">
      <div class="content flex flex-column gap-1 justify-content-start w-full">
        <LiveBadge v-if="!props.saved" class="align-self-start" />
        <h2 class="text-sm line-height-2 truncate t2lines no-hyphens">
          {{ reactiveData.title }}
        </h2>
        <p v-if="props.saved" class="text-xs">{{ reactiveData.showTitle }}</p>
        <div
          class="blurb truncate t3lines html-formatting p1"
          v-html="reactiveData?.onTodaysShowHeadline ?? reactiveData?.details"
        />
      </div>
    </div>
  </div>

  <div v-else class="skeleton-holder flex gap-3">
    <div>
      <Skeleton
        :width="`${props.size}px`"
        :height="`${props.size}px`"
        borderRadius="0px"
      />
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
.live-item {
  .v-image-publisher.image {
    flex: none;
    width: v-bind(size);
  }
}
</style>
<style lang="scss">
.live-item {
  .v-image-publisher.image .image {
    background-color: #ffffff;
  }
}
</style>
