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
    class="news-card p-ripple p-2 md:p-3"
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
        <div class="flex align-items-center justify-content-between">
          <PipeData>
            <template #left>{{ props.sourceLabel }}</template>
            <template #right>
              <span class="nobreak">{{ howLongAgo(props.newsData?.newsdate) }}</span>
            </template>
          </PipeData>
          <PlayButton
            class="hidden md:flex"
            :label="getMinutes(props.newsData?.duration, 1)"
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
  <div v-else class="news-card skeleton-holder flex p-2 md:p-3">
    <Skeleton height="16px" width="91px" borderRadius="0px" />
    <div class="w-full">
      <Skeleton
        height="13px"
        width="45%"
        borderRadius="16px"
        style="margin-bottom: 8px"
      />
      <div class="flex align-items-center justify-content-between">
        <Skeleton height="13px" width="50%" borderRadius="16px" />
        <Skeleton
          class="hidden md:block"
          height="28px"
          width="86px"
          borderRadius="15px"
        />
      </div>
    </div>
    <Skeleton class="md:hidden" height="28px" width="86px" borderRadius="15px" />
  </div>
</template>

<style lang="scss" scoped>
.news-card {
  background-color: var(--p-surface-25);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  justify-content: space-between;
  cursor: pointer;
  .news-title {
    font-size: 0.813rem;
  }
}
</style>
