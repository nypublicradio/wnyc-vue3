<script setup>
const props = defineProps({
  htmlContent: String,
})

const parsedContent = computed(() => {
  const parser = new DOMParser()
  const doc = parser.parseFromString(props.htmlContent, "text/html")
  const body = doc.body
  const parts = []

  body.childNodes.forEach((node) => {
    console.log("node  = ", node)
    console.log("node.nodeType  = ", node.nodeType)
    console.log("Node.ELEMENT_NODE  = ", Node.ELEMENT_NODE)
    console.log("node.tagName  = ", node.tagName)
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName.toLowerCase() === "a") {
      const href = node.getAttribute("href")
      const text = node.textContent
      const type = href.startsWith("http") ? "external" : "internal"
      parts.push({ type, href, text })
    } else {
      parts.push({ type: "text", text: node.outerHTML })
    }
  })

  return parts
})
</script>

<template>
  <div class="html-formatting">
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
      {{ part.type }}
    </template>
  </div>
</template>
