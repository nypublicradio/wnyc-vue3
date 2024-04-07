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

// check if the string is HTML
const isHTML = (str) => {
  const doc = new DOMParser().parseFromString(str, "text/html")
  return Array.from(doc.body.childNodes).some((node) => node.nodeType === 1)
}
</script>

<template>
  <HTML2Vue
    v-if="isHTML(props.htmlContent)"
    :value="parseHtml"
    :componentsMap="{ NuxtLink }"
    class="html-formatting"
  />
  <div v-else>{{ props.htmlContent }}</div>
</template>
