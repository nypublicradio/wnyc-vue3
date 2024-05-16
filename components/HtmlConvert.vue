<script setup>
import { HTML2Vue } from "html2vue-renderer"
import { NuxtLink } from "#components"
import VImage from "@nypublicradio/nypr-design-system-vue3/v2/src/components/VImage.vue"
const props = defineProps({
  htmlContent: {
    type: String,
    default: "",
  },
})

// check if the image is a gif
const isGif = (imageUrl) => {
  const extension = imageUrl.split(".").pop()?.toLowerCase()
  return extension === "gif"
}

const imgWidth = ref(null)
// make it HTML bny wrapping it in a div

const parseHtml = computed(() => {
  const asHtml = `<div class="html-convert">${props.htmlContent}</div>`
  const updatedHTML = asHtml
    .replace(/<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g, (match, href, text) => {
      const isInternal = !href.startsWith("http")
      return isInternal
        ? `<NuxtLink to="${href}">${text}</NuxtLink>`
        : `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
    })
    .replace(/<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g, (match, src, alt) => {
      //return `<VImage src="${src}" alt="${alt}" :width="${400}" />`
      return isGif(src)
        ? `<img src="${src}" alt="${alt}" />`
        : `<VImage src="${src}" alt="${alt}" :width="${imgWidth.value}" />`
    })

  return updatedHTML
})

onMounted(() => {
  window.innerWidth > 768 ? (imgWidth.value = 672) : (imgWidth.value = 382)
})
watch(props.htmlContent, () => {
  parseHtml()
})
</script>

<template>
  <HTML2Vue
    :value="parseHtml"
    :componentsMap="{ NuxtLink, VImage }"
    class="html-formatting"
  />
</template>
