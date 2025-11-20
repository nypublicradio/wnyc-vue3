<script setup lang="ts">
import type { InformationPage } from "../composables/types/Page"

defineProps<{
  page: InformationPage
}>()
</script>

<template>
  <div>
    <section v-if="page" class="section-page mb-5">
      <div class="content">
        <h1 class="mb-5">
          {{ page.title }}
        </h1>
        <hr />
        <!-- page content -->
        <v-streamfield v-if="page.body" :streamfield-blocks="page.body" class="pt-4" />
      </div>
    </section>
  </div>
</template>
