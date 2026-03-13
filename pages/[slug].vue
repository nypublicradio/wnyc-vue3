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

/* Handle 404 during SSR by checking page existence first */
if (import.meta.server) {
  const slug = `/${route?.params?.slug as string}`
  console.log('[slug] SERVER - Checking page existence for:', slug)
  
  // Make a direct server-side check before component renders
  try {
    const config = useRuntimeConfig()
    const result = await $fetch(`${config.public.AVIARY_BASE_API}pages/find/`, {
      query: { html_path: slug },
      headers: {
        'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443',
      },
    })
    console.log('[slug] SERVER - Page found:', slug)
  } catch (err: any) {
    console.log('[slug] SERVER - Page NOT found:', slug, 'status:', err?.statusCode)
    if (err?.statusCode === 404) {
      const event = useRequestEvent()
      if (event) {
        console.log('[slug] SERVER - Setting 404 status')
        setResponseStatus(event, 404, 'Page Not Found')
      }
      throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
        fatal: true,
      })
    }
  }
}

/* preview */
import { usePreviewData } from "~/composables/states"
const previewData = usePreviewData()
const isPreview = Boolean(route.query.preview)

let page
if (isPreview) {
  console.log('[slug] Using preview data')
  page = previewData.value.data
} else {
  const slug = `/${route?.params?.slug as string}`
  
  // Fetch the page data (already validated on server if SSR)
  const { data, error } = await useFetch('/api/pages/wagtail/find', {
    key: `page-${slug}`,
    query: { html_path: slug },
  })
  
  console.log('[slug] Data fetch:', {
    hasData: !!data.value,
    hasError: !!error.value,
    env: { server: import.meta.server, client: import.meta.client },
  })
  
  // Handle error case (shouldn't happen after server check, but handle for client-only nav)
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
