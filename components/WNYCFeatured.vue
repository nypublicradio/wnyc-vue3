<script async setup>
import { ref } from 'vue'

const { data: bucket } = await useFetch(
  'https://api.wnyc.org//api/v3/buckets/wnyc-home-middle/'
)
console.log(
  'bucket = ',
  bucket?.value?.data?.attributes['bucket-items'][0].attributes
)
</script>

<template>
  <div>
    <div class="wnyc-featured">
      <HorizontalScrollFeature>
        <CardLarge
          v-for="item in bucket?.data?.attributes['bucket-items']"
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
