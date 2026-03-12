<!--
  This is the dynamic page component for rendering pages based on their slug.
  It supports both preview mode and normal mode.
-->

<script setup lang="ts">
import type { InformationPage } from "~/composables/types/Page"

const route = useRoute()

/* preview */
import { usePreviewData } from "~/composables/states"
const previewData = usePreviewData()
const isPreview = Boolean(route.query.preview)

let page
if (isPreview) {
  console.log('[slug] Using preview data')
  page = previewData.value.data
} else {
  console.log('[slug] ============ START PAGE LOAD ============')
  console.log('[slug] Loading page for slug:', route?.params?.slug)
  console.log('[slug] Full path:', `/${route?.params?.slug as string}`)
  console.log('[slug] Environment:', { server: import.meta.server, client: import.meta.client })
  
  const result = await findPage(`/${route?.params?.slug as string}`)
  
  // Debug logging to understand what's being returned
  console.log('[slug] findPage completed with result:', {
    slug: route?.params?.slug,
    hasError: !!result.error?.value,
    hasData: !!result.data?.value,
    status: result.status?.value,
    errorDetails: result.error?.value ? JSON.stringify(result.error.value) : 'none',
    errorStatusCode: result.error?.value?.statusCode,
    errorStatusMessage: result.error?.value?.statusMessage,
    dataType: result.data?.value ? typeof result.data.value : 'undefined',
    dataKeys: result.data?.value ? Object.keys(result.data.value) : [],
    dataPreview: result.data?.value ? JSON.stringify(result.data.value).substring(0, 300) : 'null',
  })
  
  // Check if the API returned an error, no data, or error status
  const hasApiError = result.error?.value || !result.data?.value || (result.status?.value && result.status.value !== 'success')
  
  if (hasApiError) {
    console.log('[slug] ERROR DETECTED - Entering 404 flow')
    console.log('[slug] Error check details:', {
      'result.error?.value': !!result.error?.value,
      'result.data?.value': !!result.data?.value,
      'result.status?.value': result.status?.value,
      'import.meta.server': import.meta.server,
    })
    
    // Set the response status code on the server side before throwing the error
    if (import.meta.server) {
      const event = useRequestEvent()
      console.log('[slug] useRequestEvent returned:', !!event)
      if (event) {
        console.log('[slug] Calling setResponseStatus with 404 for:', route?.params?.slug)
        setResponseStatus(event, 404, 'Page Not Found')
        console.log('[slug] setResponseStatus completed')
      } else {
        console.log('[slug] WARNING: No event object available for setResponseStatus')
      }
    } else {
      console.log('[slug] Client-side, skipping setResponseStatus')
    }
    
    console.log('[slug] About to throw createError')
    throw createError({
      statusCode: result.error?.value?.statusCode || 404,
      statusMessage: result.error?.value?.statusMessage || "Page Not Found",
      fatal: true,
    })
  }
  
  console.log('[slug] SUCCESS - Page data found, normalizing...')
  // Normalize the page data - data is already camelized from the API
  page = normalizeFindPageResponse(result.data)
  console.log('[slug] Page normalized, type:', page?.type)
  console.log('[slug] ============ END PAGE LOAD (SUCCESS) ============')
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
