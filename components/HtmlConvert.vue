<script setup>
import { computed, ref, watch, nextTick, toRef, resolveComponent } from "vue"
import { useHtmlParser } from "~/composables/useHtmlParser"

const ResolvedNuxtLink = resolveComponent("NuxtLink")

const props = defineProps({
  htmlContent: {
    type: [String, Array, Object],
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
    // 658 is the max width of the content area
    // 48 is the padding of the content area
    return window.innerWidth >= 1200 ? 658 : window.innerWidth - 48
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
    content = content.map((item) => item?.value || "").join("\n")
  } else if (typeof content === "object" && content !== null) {
    content = content.value || content.html || ""
  }

  // Ensure we are working with a string before replacing
  if (typeof content !== "string") {
    content = String(content)
  }
  // strip all tags and use as just a string
  if (props.stringify) {
    content = content.replace(/<[^>]*>/g, "")
  }
  return content
})

const defaultTagClassMap = {
  div: "text-base line-height-3",
  span: "text-base line-height-3",
  p: "text-base line-height-3",
  a: "",
  h1: "text-4xl",
  h2: "text-3xl",
  h3: "text-2xl",
  h4: "text-xl",
  h5: "text-lg",
  h6: "text-base",
  ul: "pl-3 mb-3",
  ol: "pl-3 mb-3",
  li: "mb-2",
  blockquote: "border-left-2 border-primary pl-3 ml-0 font-italic text-600",
}

// Create the render tree function via our parsed composable whenever the string or width updates
const parsedNodes = computed(() => {
  if (!rawHtmlString.value) return null

  const mergedClassMap = { ...defaultTagClassMap, ...props.tagClassMap }

  // You can pass the tagClassMap prop directly from the parent to inject Vue Primeflex classes.
  const renderFn = useHtmlParser(rawHtmlString.value, {
    parentWidth: parentWidth.value,
    tagClassMap: mergedClassMap,
    NuxtLink: ResolvedNuxtLink,
  })

  return renderFn
})

// Watch for changes to measure width if images are present
watch(rawHtmlString, (newContent) => {
  if (!newContent) return

  const hasImages = /<img[^>]*>/i.test(newContent)
  if (hasImages) {
    parentWidth.value = getFallbackWidth()
    nextTick(() => {
      updateParentWidth()
    })
  }
})

// Run the initial width measurement after mount so the server and client
// both use parentWidth=304 during SSR/hydration, avoiding mismatches.
onMounted(() => {
  const newContent = rawHtmlString.value
  if (!newContent) return
  const hasImages = /<img[^>]*>/i.test(newContent)
  if (hasImages) {
    parentWidth.value = getFallbackWidth()
    nextTick(() => {
      updateParentWidth()
    })
  }
})
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
