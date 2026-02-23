<script setup>
import { computed, ref, watch, nextTick, toRef } from "vue"
import { useHtmlParser } from "~/composables/useHtmlParser"

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
  tagClassMap: {
    type: Object,
    default: () => ({}),
  },
})

const reactiveHtmlContent = toRef(props, "htmlContent")
const htmlConvertRef = ref(null)
const parentWidth = ref(304) // Default fallback value

// Function to get fallback width based on screen size
const getFallbackWidth = () => {
  if (typeof window !== "undefined") {
    return window.innerWidth > 768 ? 672 : 382
  }
  return 304
}

// Function to update parent width
const updateParentWidth = () => {
  if (htmlConvertRef.value) {
    const newWidth = htmlConvertRef.value.clientWidth
    if (newWidth > 0) {
      parentWidth.value = newWidth
    } else {
      parentWidth.value = getFallbackWidth()
    }
  } else {
    parentWidth.value = getFallbackWidth()
  }
}

// Process the raw content into a single string
const rawHtmlString = computed(() => {
  let content = reactiveHtmlContent.value
  if (!content) return ""

  if (Array.isArray(content)) {
    content = content.map((item) => item.value).join("\n")
  }

  if (props.stringify) {
    content = content.replace(/<[^>]*>/g, "")
  }
  return content
})

// Create the render tree function via our parsed composable whenever the string or width updates
const parsedNodes = computed(() => {
  if (!rawHtmlString.value) return null

  // You can pass the tagClassMap prop directly from the parent to inject Vue Primeflex classes.
  const renderFn = useHtmlParser(rawHtmlString.value, {
    parentWidth: parentWidth.value,
    tagClassMap: props.tagClassMap,
  })

  return renderFn
})

// Watch for changes to measure width if images are present
watch(
  rawHtmlString,
  (newContent) => {
    if (!newContent) return

    const hasImages = /<img[^>]*>/i.test(newContent)
    if (hasImages) {
      parentWidth.value = getFallbackWidth()
      nextTick(() => {
        updateParentWidth()
      })
    }
  },
  { immediate: true }
)
</script>

<template>
  <div ref="htmlConvertRef" class="html-convert-container">
    <div
      class="html-formatting"
      :class="[{ 'no-blocks': noBlocks }, props.htmlClasses]"
    >
      <component :is="parsedNodes" v-if="parsedNodes" />
    </div>
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
