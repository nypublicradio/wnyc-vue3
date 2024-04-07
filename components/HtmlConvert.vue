<script setup>
import { HTML2Vue } from "html2vue-renderer"
import { NuxtLink } from "#components"
const props = defineProps({
  htmlContent: {
    type: String,
    default: "",
  },
})

const parseHtml = computed(() => {
  const updatedHTML = props.htmlContent.replace(
    /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
    (match, href, text) => {
      const isInternal = !href.startsWith("http")
      return isInternal
        ? `<NuxtLink to="${href}">${text}</NuxtLink>`
        : `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    }
  )
  return updatedHTML
})
</script>

<template>
  <HTML2Vue :value="parseHtml" :componentsMap="{ NuxtLink }" class="html-formatting" />
</template>
