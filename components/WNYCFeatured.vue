<script async setup>
import { formatPublisherImageUrl } from '~/utilities/helpers'
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  //   propVar: {
  //     type: Boolean,
  //     default: false,
  //   },
})

// const { data: bucket } = await useFetch(
//   'https://internal.wnyc.org/admin/touts/bucket/680249/'
// )

const { data: bucket } = await useFetch(
  'https://api.wnyc.org//api/v3/buckets/wnyc-home-middle/'
)
console.log(
  'bucket = ',
  bucket.value.data.attributes['bucket-items'][0].attributes
)
//
//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature>
        <div
          class="card-large mb-4"
          v-for="item in bucket.data.attributes['bucket-items']"
        >
          <div class="top">
            <VImagePublisher
              :src="
                formatPublisherImageUrl(item.attributes['image-main'].template)
              "
              :width="248"
              :height="159"
            />
          </div>
          <div class="bottom">content</div>
        </div>
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-featured {
  .card-large {
    display: flex;
    flex-direction: column;
    border-radius: 8px;
    overflow: hidden;
    max-width: 248px;
    background-color: var(--background2);
  }
}
</style>
