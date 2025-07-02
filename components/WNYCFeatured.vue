<script async setup>
const props = defineProps({
  articles: {
    type: Object,
    default: null,
  },
})
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature :data="props.articles">
        <template #default>
          <MediaCard
            v-for="(item, index) in props.articles"
            :data="item"
            :key="`horzScroll-${item.label}`"
            is-vertical
            :size="[3, 2]"
            :showBg="true"
            :showBgMobile="true"
            :hideDate="true"
            :showTease="true"
            class="item btn"
          />
        </template>
        <template #skeleton>
          <div class="flex w-full">
            <skeleton-media-card
              v-for="i in 5"
              :key="`${i}-skeleton`"
              is-vertical
              :size="[3, 2]"
              :showBg="true"
              :showBgMobile="true"
              :hideDate="true"
              :showTease="true"
              class="item btn"
            />
          </div>
        </template>
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item {
  min-width: 248px;
  max-width: 248px;
}
</style>
