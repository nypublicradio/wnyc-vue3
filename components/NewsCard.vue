<script setup>
import { getMinutes, howLongAgo } from "~/utilities/helpers"

const props = defineProps({
  newsData: {
    type: Object,
    default: null,
  },
  sourceLabel: {
    type: String,
    default: "WNYC",
  },
  badgeLabel: {
    type: String,
    default: "Local News",
  },
  bagdeColor: {
    type: String,
    default: "var(--p-surface-950)",
  },
  badgeBgColor: {
    type: String,
    default: "var(--p-yellow-500)",
  },
})

const emit = defineEmits(["on-click"])
</script>

<template>
  <div
    v-if="newsData"
    class="news-card p-ripple"
    @click="emit('on-click')"
    v-ripple
  >
    <div>
      <VBadge
        :label="props.badgeLabel"
        :color="props.bagdeColor"
        :bg-color="props.badgeBgColor"
      />
      <div class="news-title mt-2">
        <h2 class="text-sm md:text-base">{{ props.newsData?.cardTitle }}</h2>
        <div
          class="flex align-items-center justify-content-between lg:text-base"
        >
          <PipeData>
            <template #left>{{ props.sourceLabel }}</template>
            <template #right>
              <ClientOnly>
                <span class="nobreak">{{
                  howLongAgo(props.newsData?.newsdate)
                }}</span>
              </ClientOnly>
            </template>
          </PipeData>
          <PlayButton
            class="hidden md:flex"
            :label="getMinutes(props.newsData?.duration, 1)"
            :data="props.newsData"
          />
          <BarsPlaying
            class="hidden md:block absolute top-0 right-0 mt-3 mr-4"
            :data="props.newsData"
          />
        </div>
      </div>
    </div>
    <div class="flex align-items-center justify-content-between md:hidden">
      <PlayButton
        :label="getMinutes(props.newsData?.duration, 1)"
        :data="props.newsData"
      />
      <BarsPlaying class="mr-2" :data="props.newsData" />
    </div>
  </div>
  <div v-else class="news-card skeleton-holder flex p-2 md:p-3 lg:p-3">
    <Skeleton height="19px" width="91px" borderRadius="0px" />
    <div class="w-full">
      <Skeleton
        height="14px"
        width="45%"
        borderRadius="16px"
        style="margin-bottom: 11px"
      />
      <div class="flex align-items-center justify-content-between">
        <Skeleton height="14px" width="50%" borderRadius="16px" />
        <Skeleton
          class="hidden md:block"
          height="28px"
          width="86px"
          borderRadius="15px"
        />
      </div>
    </div>
    <Skeleton
      class="md:hidden"
      height="28px"
      width="86px"
      borderRadius="15px"
    />
  </div>
</template>

<style lang="scss" scoped>
.news-card {
  background-color: var(--p-content-background);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  justify-content: space-between;
  cursor: pointer;
  padding: 1.25rem;
  @include media("<md") {
    padding: 0.6rem;
  }
  .news-title {
    font-size: 0.813rem;
  }
}
</style>
