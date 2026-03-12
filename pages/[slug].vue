<!--
  This is the dynamic page component for rendering pages based on their slug.
  It supports both preview mode and normal mode.
  It also handles redirects from Wagtail CMS.
-->

<script setup lang="ts">
import type { InformationPage } from "~/composables/types/Page"

const route = useRoute()

/* preview */
import { usePreviewData } from "~/composables/states"
const previewData = usePreviewData()
const isPreview = Boolean(route.query.preview)

const page = isPreview
  ? previewData.value.data
  : await findPage(`/${route?.params?.slug as string}`)
      .then(({ data, error }) => {
        // Check if this is a redirect from Wagtail
        if (data?.value?.redirect) {
          // Preserve query params from the original request
          const queryString = route.fullPath.includes('?') 
            ? route.fullPath.substring(route.fullPath.indexOf('?'))
            : ''
          
          navigateTo(data.value.location + queryString, {
            redirectCode: data.value.statusCode || 301,
            external: false,
          })
          return null // Return null to prevent further processing
        }
        
        // Check for API errors
        if (error?.value) {
          throw createError({
            statusCode: error.value.statusCode || 404,
            statusMessage: error.value.statusMessage || "Page Not Found",
            fatal: true,
          })
        }
        
        return normalizeFindPageResponse(data)
      })

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
  <div v-if="page">
    <InformationPageTemplate
      v-if="page?.type === 'information_page'"
      :page="page as InformationPage"
    />
  </div>
</template>
