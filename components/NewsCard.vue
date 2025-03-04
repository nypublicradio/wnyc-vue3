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
  <div v-if="newsData" class="news-card p-ripple" @click="emit('on-click')" v-ripple>
    <div>
      <VBadge
        :label="props.badgeLabel"
        :color="props.bagdeColor"
        :bg-color="props.badgeBgColor"
      />
      <div class="news-title mt-2">
        <h2 class="text-sm">{{ props.newsData?.cardTitle }}</h2>
        <PipeData>
          <template #left>{{ props.sourceLabel }}</template>
          <template #right>
            <span class="nobreak">{{ howLongAgo(props.newsData?.newsdate) }}</span>
          </template>
        </PipeData>
      </div>
    </div>
    <div class="flex align-items-center justify-content-between">
      <PlayButton
        :label="getMinutes(props.newsData?.duration, 1)"
        :data="props.newsData"
      />
      <BarsPlaying class="mr-2" :data="props.newsData" />
    </div>
  </div>
  <div v-else class="news-card skeleton-holder flex">
    <Skeleton height="16px" width="91px" borderRadius="0px" />
    <div class="w-full">
      <Skeleton
        height="13px"
        width="55%"
        borderRadius="16px"
        style="margin-bottom: 8px"
      />
      <Skeleton height="13px" width="70%" borderRadius="16px" />
    </div>
    <Skeleton height="28px" width="84px" borderRadius="15px" />
  </div>
</template>

<style lang="scss" scoped>
.news-card {
  background-color: var(--p-surface-25);
  padding: 10px;
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
