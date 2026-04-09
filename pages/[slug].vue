<!--
  This is the dynamic page component for rendering pages based on their slug.
  It supports both preview mode and normal mode.
-->

<script setup lang="ts">
import type { InformationPage } from "~/composables/types/Page"
const config = useRuntimeConfig()
const route = useRoute()

/* preview */
import { usePreviewData } from "~/composables/states"
const previewData = usePreviewData()
const isPreview = Boolean(route.query.preview)

let page
if (isPreview) {
  if (!previewData.value || !previewData.value.data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Preview data not found',
      fatal: true,
    })
  }
  page = previewData.value.data
} else {
  const slug = `/${route?.params?.slug as string}`
  const { data, error } = await useAsyncData(
    `page-${slug}`,
    () => $fetch(`${config.public.BFF_URL}/api/pages/wagtail/find`, { query: { html_path: slug } })
  )
  
  if (error.value || !data.value) {
    throw createError({
      statusCode: error.value?.statusCode || 404,
      statusMessage: error.value?.message || 'Page Not Found',
      fatal: true,
    })
  }
  
  page = normalizeFindPageResponse(data)
}

// const { $analytics } = useNuxtApp()

// onMounted(() => {
//   if (isPreview) return

//   switch (page?.type) {
//     case "information_page":
//       $analytics.schedulePageView({
//         page_type: "information_page",
//         content_group: "static-page",
//       })
//       break
//     default:
//       throw createError({
//         statusCode: 404,
//         statusMessage: "Page Not Found",
//         fatal: true,
//       })
//   }
// })
</script>

<template>
  <div>
    <InformationPageTemplate
      v-if="page?.type === 'information_page'"
      :page="page as InformationPage"
    />
  </div>
</template>