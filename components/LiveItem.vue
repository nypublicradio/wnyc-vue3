<script setup>
import { trackClickEvent, templatizePublisherImageUrl } from "~/utilities/helpers"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"

const props = defineProps({
  episode: {
    type: Object,
    default: null,
  },
  size: {
    type: Number,
    default: 72,
  },
})

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
console.log("props.episode = ", props.episode)
</script>

<template>
  <div class="live-item flex gap-3">
    <VImage
      v-if="props.episode?.image"
      :src="templatizePublisherImageUrl(props.episode?.image)"
      :width="props.size"
      :height="props.size"
      :ratio="[1, 1]"
      alt="show poster image"
      class="image"
    />
    <div class="info flex gap-3">
      <div class="content flex flex-column gap-1 justify-content-start">
        <LiveBadge class="align-self-start" />
        <h2>{{ props.episode?.title }}</h2>
        <p
          class="blurb truncate t3lines"
          v-html="props.episode?.onTodaysShowHeadline ?? props.episode?.details"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.live-item {
  .v-image-publisher.image {
    flex: none;
    width: 100px;
  }
}
</style>
