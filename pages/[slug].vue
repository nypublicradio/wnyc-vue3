<!--
  This is the dynamic page component for rendering pages based on their slug.
  It supports both preview mode and normal mode.
-->

<script setup lang="ts">
import type { InformationPage } from "~/composables/types/Page"

const route = useRoute()
const config = useRuntimeConfig()

// Validate the slug param before rendering — reject file-like paths and invalid slugs
definePageMeta({
  validate: (route) => {
    const slug = route.params.slug as string
    if (!slug) return false
    // Reject paths with file extensions (e.g. sw.js, _payload.json)
    if (slug.includes('.')) return false
    // Only allow valid URL slugs (lowercase alphanumeric, hyphens, underscores)
    return /^[a-z0-9][a-z0-9-_]*$/.test(slug)
  },
})

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
  // Fetch page data - server middleware has already checked existence and thrown 404 if needed
  const slug = `/${route?.params?.slug as string}`
  const { data, error } = useFetch(`${config.public.BFF_URL}/api/pages/wagtail/find`, {
    key: `page-${slug}`,
    query: { html_path: slug },
  })
  
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