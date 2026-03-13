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
  console.log('[slug] Environment:', { server: import.meta.server, client: import.meta.client })
  
  const slug = `/${route?.params?.slug as string}`
  console.log('[slug] Fetching page for:', slug)
  
  // Use useAsyncData with $fetch for better error control
  const { data, error } = await useAsyncData(
    `page-${slug}`,
    async () => {
      try {
        const response = await $fetch('/api/pages/wagtail/find', {
          query: { html_path: slug },
        })
        console.log('[slug] Fetch SUCCESS')
        return response
      } catch (err: any) {
        console.log('[slug] Fetch ERROR:', {
          statusCode: err?.statusCode,
          message: err?.message,
        })
        
        // On server, set the status code immediately when we catch the error
        if (import.meta.server) {
          const event = useRequestEvent()
          if (event) {
            console.log('[slug] Setting response status to', err?.statusCode || 404)
            setResponseStatus(event, err?.statusCode || 404, err?.message || 'Page Not Found')
          }
        }
        
        // Re-throw to populate the error ref
        throw err
      }
    }
  )
  
  console.log('[slug] useAsyncData completed:', {
    hasData: !!data.value,
    hasError: !!error.value,
    errorStatusCode: error.value?.statusCode,
  })
  
  // If there's an error or no data, throw to show error page
  if (error.value || !data.value) {
    console.log('[slug] Throwing error to display error  page')
    throw createError({
      statusCode: error.value?.statusCode || 404,
      statusMessage: error.value?.message || "Page Not Found",
      fatal: true,
    })
  }
  
  console.log('[slug] SUCCESS - Normalizing page data')
  page = normalizeFindPageResponse(data)
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
