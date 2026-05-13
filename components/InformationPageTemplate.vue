<script setup lang="ts">
import type { InformationPage } from "../composables/types/Page"

const props = defineProps<{
  page: InformationPage
}>()

const title = `${props.page.title} | WNYC`
const searchDescription = props.page?.meta?.seoDescription
const socialDescription = props.page?.socialText
useHead({
  title,
})
useSeoMeta({
  title,
  ogTitle: title,
  description: searchDescription,
  ogDescription: socialDescription,
})
</script>

<template>
  <div>
    <section v-if="page" class="information-page md:pt-6 mb-5">
      <div class="content">
        <h1 class="mb-5">
          {{ page.title }}
        </h1>
        <hr />
        <v-streamfield v-if="page.body" :streamfield-blocks="page.body" class="pt-4" />
      </div>
    </section>
  </div>
</template>

<style lang="scss" scoped>
.information-page {
  .content {
    max-width: 614px;
    margin: 0 auto;
  }
}
</style>
