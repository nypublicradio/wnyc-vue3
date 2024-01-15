<script setup>
import { getMinutes, howLongAgo } from "~/utilities/helpers"
// TEMP fix to make ripple work
import { usePrimeVue } from "primevue/config"
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

const props = defineProps({
  newsData: {
    type: Object,
    default: null,
  },
  source: {
    type: String,
    default: "WNYC",
  },
  badgeLabel: {
    type: String,
    default: "Local NYC News",
  },
  bagdeColor: {
    type: String,
    default: "var(--night-500)",
  },
  badgeBgColor: {
    type: String,
    default: "var(--yellow)",
  },
})

const emit = defineEmits(["on-click"])

//console.log('newsData' + props.source, props.newsData)
</script>

<template>
  <div v-if="newsData" class="news-card p-ripple" @click="emit('on-click')" v-ripple>
    <div>
      <Badge
        :label="props.badgeLabel"
        :color="props.bagdeColor"
        :bg-color="props.badgeBgColor"
      />
      <div class="news-title mt-2">
        <div class="font-bold">{{ props.newsData?.cardTitle }}</div>
        <PipeData>
          <template #left>{{ props.source }}</template>
          <template #right>
            <span class="nobreak">{{ howLongAgo(props.newsData?.newsdate) }}</span>
          </template>
        </PipeData>
      </div>
    </div>
    <PlayButton
      :label="getMinutes(props.newsData?.duration)"
      :file="props.newsData?.file"
    />
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
  background-color: var(--background2);
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
