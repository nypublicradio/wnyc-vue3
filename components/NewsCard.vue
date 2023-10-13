<script setup>
import { trackClickEvent, getMinutes, howLongAgo } from '~/utilities/helpers'
// TEMP fix to make ripple work
import { usePrimeVue } from 'primevue/config'
const $primevue = usePrimeVue()
defineExpose({
  $primevue,
})
// TEMP fix to make ripple work

const props = defineProps({
  newsData: {
    type: Object,
    default: null,
    required: true,
  },
  source: {
    type: String,
    default: 'WNYC',
  },
  badgeLabel: {
    type: String,
    default: 'Local NYC News',
  },
  bagdeColor: {
    type: String,
    default: 'var(--night-500)',
  },
  badgeBgColor: {
    type: String,
    default: 'var(--yellow)',
  },
})

const emit = defineEmits(['on-click'])

//console.log('newsData' + props.source, props.newsData)
</script>

<template>
  <div class="news-card p-ripple" @click="emit('on-click')" v-ripple>
    <div>
      <Badge
        :label="props.badgeLabel"
        :color="props.bagdeColor"
        :bg-color="props.badgeBgColor"
      />
      <div class="news-title mt-2">
        <div class="font-bold">{{ newsData.cardTitle }}</div>
        <PipeData>
          <template #left>{{ props.source }}</template>
          <template #right>
            <span class="nobreak">{{ howLongAgo(newsData.newsdate) }}</span>
          </template>
        </PipeData>
      </div>
    </div>
    <PlayButton :label="getMinutes(newsData.duration)" :file="newsData.file" />
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
