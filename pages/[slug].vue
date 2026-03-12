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
  page = previewData.value.data
} else {
  const result = await findPage(`/${route?.params?.slug as string}`)
  
  // Check if the API returned an error (useFetch doesn't throw, it returns errors)
  if (result.error?.value || !result.data?.value) {
    // Set the response status code on the server side before throwing the error
    if (import.meta.server) {
      const event = useRequestEvent()
      if (event) {
        setResponseStatus(event, 404, 'Page Not Found')
      }
    }
    
    throw createError({
      statusCode: 404,
      statusMessage: "Page Not Found",
      fatal: true,
    })
  }
  
  page = normalizeFindPageResponse(result.data)
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
