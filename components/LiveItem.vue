<script setup>
import { trackClickEvent, templatizePublisherImageUrl } from "~/utilities/helpers"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"

const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  size: {
    type: Number,
    default: 72,
  },
  saved: {
    type: Boolean,
    default: false,
  },
})

const size = ref(props.size)

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
console.log("props.episode = ", props.data)
</script>

<template>
  <div class="live-item flex gap-3">
    <VImage
      v-if="props.data?.image"
      :src="props.data?.image?.template ?? templatizePublisherImageUrl(props.data?.image)"
      :width="size"
      :height="size"
      :ratio="[1, 1]"
      alt="show poster image"
      class="image"
    />
    <div class="info flex gap-3">
      <div class="content flex flex-column gap-1 justify-content-start">
        <LiveBadge v-if="!props.saved" class="align-self-start" />
        <h2>{{ props.data?.title }}</h2>
        <p
          class="blurb truncate t3lines"
          v-html="props.data?.onTodaysShowHeadline ?? props.data?.details"
        />
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
