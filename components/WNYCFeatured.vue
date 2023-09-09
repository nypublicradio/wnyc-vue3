<script async setup>
import { ref } from 'vue'

const bucket = await usePublisherFetch('/buckets/wnyc-home-middle/')

console.log(
  'bucket = ',
  bucket?.data?.value?.data?.attributes.bucketItems[0].attributes
)
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature>
        <CardLarge
          v-for="item in bucket?.data?.value?.data?.attributes?.bucketItems"
          :item="item"
          style="min-width: 248px"
        />
      </HorizontalScrollFeature>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-featured {
}
</style>
