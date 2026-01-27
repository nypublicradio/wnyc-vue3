<script setup>
import { HTML2Vue } from "html2vue-renderer"
import { NuxtLink } from "#components"
import VImage from "~/components/VImage.vue"
import { useVImage } from "~/composables/useVImage"

const { getImageDimensions, templatizeImageUrl } = useVImage()

const props = defineProps({
  htmlContent: {
    type: [String, Array],
    default: "",
  },
  htmlClasses: {
    type: String,
    default: "",
  },
  noBlocks: {
    type: Boolean,
    default: false,
  },
  stringify: {
    type: Boolean,
    default: false,
  },
})

const reactiveHtmlContent = toRef(props, "htmlContent")

const theParcedHtml = ref(null)
const imagePropsMap = ref({})
const htmlConvertRef = ref(null)
const parentWidth = ref(304) // Default fallback value

// Function to get fallback width based on screen size
const getFallbackWidth = () => {
  if (typeof window !== "undefined") {
    return window.innerWidth > 768 ? 672 : 382
  }
  return 304
}

// check if the image is a gif
const isGif = (imageUrl) => {
  const extension = imageUrl.split(".").pop()?.toLowerCase()
  return extension === "gif"
}

const parseHtml = (newHtmlContent) => {
  // make it HTML by wrapping it in a div
  const asHtml = `<div class="html-convert">${newHtmlContent}</div>`

  // Reset the image props map
  imagePropsMap.value = {}
  let imageCounter = 0

  const updatedHTML = asHtml
    .replace(
      /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/g,
      (match, href, text) => {
        const isInternal = !href.startsWith("http")
        return isInternal
          ? `<NuxtLink to="${href}">${text}</NuxtLink>`
          : `<a href="${href}" target="_blank" rel="noopener noreferrer">${text}</a>`
      }
    )
    .replace(
      /<img[^>]*src="([^"]+)"[^>]*alt="([^"]+)"[^>]*>/g,
      (match, src, alt) => {
        const imgDimensions = getImageDimensions(src)
        const imgHeight = Math.round(
          (parentWidth.value * imgDimensions[1]) / imgDimensions[0]
        )

        if (isGif(src)) {
          return `<img src="${src}" alt="${alt}" />`
        } else {
          // Create unique identifiers for this image's props
          const sizePropsId = `imageSize${imageCounter}`
          const srcsetPropsId = `imageSrcset${imageCounter}`
          const widthPropsId = `imageWidth${imageCounter}`
          const heightPropsId = `imageHeight${imageCounter}`
          const srcPropsId = `imageSrc${imageCounter}`
          imageCounter++

          // Store the image props in the props map
          imagePropsMap.value[sizePropsId] = imgDimensions
          imagePropsMap.value[srcsetPropsId] = [1, 2]
          imagePropsMap.value[widthPropsId] = parentWidth.value
          imagePropsMap.value[heightPropsId] = imgHeight
          const templatizedSrc = templatizeImageUrl(src)
          imagePropsMap.value[srcPropsId] = { template: templatizedSrc }

          return `<VImage :src="${srcPropsId}" alt="${alt}" :size="${sizePropsId}" :srcset="${srcsetPropsId}" :width="${widthPropsId}" :height="${heightPropsId}"/>`
        }
      }
    )
    .replace("<p>&nbsp;</p>", "")
    // remove a p tag if it has a script
    .replace(/<p>(.*?)<\/p>/g, (match, content) => {
      return content.includes("<script") ? "" : match
    })

  theParcedHtml.value = updatedHTML
}

// Function to update parent width
const updateParentWidth = () => {
  if (htmlConvertRef.value) {
    const newWidth = htmlConvertRef.value.clientWidth
    if (newWidth > 0) {
      parentWidth.value = newWidth
    } else {
      // Fallback to responsive width if measurement fails
      parentWidth.value = getFallbackWidth()
    }
  } else {
    // Use fallback if ref is not available
    parentWidth.value = getFallbackWidth()
  }
}

// Watch for changes to htmlContent prop and re-parse HTML
watch(
  reactiveHtmlContent,
  (newContent) => {
    // If there's no HTML content, clear the parsed HTML
    if (!newContent) {
      theParcedHtml.value = null
      return
    }

    // if the content is an array, extract values
    if (Array.isArray(newContent)) {
      // extract the value out of the key "value" of each item in the array
      newContent = newContent.map((item) => item.value).join("\n")
    }
    if (props.stringify) {
      // convert all the html to a single string
      newContent = newContent.replace(/<[^>]*>/g, "")
    }

    // Check if HTML content contains images
    const hasImages = /<img[^>]*>/i.test(newContent)

    if (hasImages) {
      // Only measure parent width if there are images
      // Set initial fallback width
      parentWidth.value = getFallbackWidth()

      // Get actual width after DOM is rendered, then parse HTML
      nextTick(() => {
        updateParentWidth()
        parseHtml(newContent)
      })
    } else {
      // No images, just parse HTML without measuring width
      parseHtml(newContent)
    }
  },
  { immediate: true }
)
</script>

<template>
  <div ref="htmlConvertRef" class="html-convert-container">
    <HTML2Vue
      v-if="theParcedHtml"
      :value="theParcedHtml"
      :componentsMap="{ NuxtLink, VImage }"
      :docProps="imagePropsMap"
      class="html-formatting"
      :class="[{ 'no-blocks': noBlocks }, props.htmlClasses]"
    />
  </div>
</template>

<style lang="scss" scoped>
.html-convert-container {
  width: 100%;
  max-width: 100%;
}
</style>
<style lang="scss">
// Add global styles for html-convert if needed
</style>
