<!--
  This is the dynamic page component for rendering pages based on their slug.
  It supports both preview mode and normal mode.
-->

<script setup lang="ts">
import type { InformationPage } from "~/composables/types/Page"

const route = useRoute()

// Log immediately to see if this runs on server
console.log('[slug] SCRIPT SETUP - Environment check:', {
  server: import.meta.server,
  client: import.meta.client,
  slug: route?.params?.slug,
  nuxtApp: !!useNuxtApp(),
})

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
  
  // Debug logging
  console.log('[slug] findPage completed with result:', {
    slug: route?.params?.slug,
    hasError: !!result.error?.value,
    hasData: !!result.data?.value,
    status: result.status?.value,
    errorStatusCode: result.error?.value?.statusCode,
    errorStatusMessage: result.error?.value?.statusMessage,
  })
  
  // IMPORTANT: Check for 404 immediately and throw error
  // This must happen  during SSR to set the proper response status
  if (result.error?.value || !result.data?.value) {
    console.log('[slug] ERROR DETECTED - Page not found')
    console.log('[slug] Environment check:', {
      'import.meta.server': import.meta.server,
      'result.error?.value': !!result.error?.value,
      'result.data?.value': !!result.data?.value,
    })
    
    // On server, set the HTTP status code before throwing
    if (import.meta.server) {
      const event = useRequestEvent()
      if (event) {
        console.log('[slug] Setting response status to 404')
        setResponseStatus(event, 404, 'Page Not Found')
      }
    }
    
    // Throw error with status code - this stops rendering
    console.log('[slug] Throwing 404 error')
    throw createError({
      statusCode: result.error?.value?.statusCode || 404,
      statusMessage: result.error?.value?.statusMessage || "Page Not Found",
      fatal: true,
    })
  }
  
  console.log('[slug] SUCCESS - Page data found')
  // Normalize the page data - data is already camelized from the API
  page = normalizeFindPageResponse(result.data)
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
