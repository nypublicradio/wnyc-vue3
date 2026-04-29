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

const slug = `/${route?.params?.slug as string}`
const pageFetchResult = useFetchWrapper(
  `${config.public.BFF_URL}/api/pages/wagtail/find`,
  {
    key: `page-${slug}`,
    query: { html_path: slug },
  }
)

if (import.meta.server && !isPreview) {
  await pageFetchResult
}

const { data, error, status } = pageFetchResult

if (status.value !== 'pending' && !isPreview && (error.value || !data.value)) {
  throw createError({
    statusCode: error.value?.statusCode || 404,
    statusMessage: error.value?.message || "Page Not Found",
    fatal: true,
  })
}

const page = computed(() => {
  if (isPreview) {
    if (!previewData.value || !previewData.value.data) {
      return null
    }
    return previewData.value.data
  }
  return data.value ? normalizeFindPageResponse(data) : null
})

if (isPreview && !previewData.value?.data) {
  throw createError({
    statusCode: 404,
    statusMessage: "Preview data not found",
    fatal: true,
  })
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