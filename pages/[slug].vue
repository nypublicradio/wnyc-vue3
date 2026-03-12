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

const page = isPreview
  ? previewData.value.data
  : await findPage(`/${route?.params?.slug as string}`)
      .then(({ data }) => normalizeFindPageResponse(data))
      .catch((err) => {
        // Check if this is a redirect from Wagtail
        if (err?.data?.data?.location) {
          // Preserve query params from the original request
          const queryString = route.fullPath.includes('?') 
            ? route.fullPath.substring(route.fullPath.indexOf('?'))
            : ''
          
          navigateTo(err.data.data.location + queryString, {
            redirectCode: err.data.data.statusCode || 301,
            external: false,
          })
          return null // Return null to prevent further processing
        }
        
        // Not a redirect, throw 404
        throw createError({
          statusCode: 404,
          statusMessage: "Page Not Found",
          fatal: true,
        })
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
