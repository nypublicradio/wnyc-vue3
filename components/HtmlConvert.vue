<script setup>
const props = defineProps({
  htmlContent: String,
  tag: {
    type: String,
    default: "p",
  },
})

const parsedContent = computed(() => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(props.htmlContent, "text/html")
  const parts = []

  function processNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === "a") {
        const href = node.getAttribute("href")
        const text = node.textContent
        const type = href.startsWith("http") ? "external" : "internal"
        parts.push({ type, href, text })
      } else {
        // Process child nodes recursively
        Array.from(node.childNodes).forEach((childNode) => processNode(childNode))
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Handle text nodes
      parts.push({ type: "text", text: node.textContent })
    }
  }

  processNode(doc.body)

  return parts
})
</script>

<template>
  <component :is="props.tag" class="html-formatting">
    <template v-for="(part, index) in parsedContent" :key="index">
      <NuxtLink v-if="part.type === 'internal'" :to="part.href">{{ part.text }}</NuxtLink>
      <a
        v-else-if="part.type === 'external'"
        :href="part.href"
        target="_blank"
        rel="noopener noreferrer"
        >{{ part.text }}</a
      >
      <span v-else v-html="part.text"></span>
    </template>
  </component>
</template>
