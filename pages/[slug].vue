<!--
  This is the dynamic page component for rendering pages based on their slug.
  It supports both preview mode and normal mode.
-->

<script setup lang="ts">
import type { InformationPage } from "~/composables/types/Page"

const route = useRoute()
const config = useRuntimeConfig()


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
  const { data, error } = await useFetch(`${config.public.BFF_URL}/api/pages/wagtail/find`, {
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
</script>

<template>
  <div>
    <InformationPageTemplate
      v-if="page?.type === 'information_page'"
      :page="page as InformationPage"
    />
  </div>
</template>