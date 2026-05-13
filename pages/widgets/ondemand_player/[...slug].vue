<script setup lang="ts">
// Disable the global app layout (header/footer) so it acts like a clean widget
definePageMeta({
  layout: false,
})

const route = useRoute()
const audioUrl = ref("")

onMounted(() => {
  // Extract #file=... from the URL hash
  if (route.hash && route.hash.startsWith("#file=")) {
    // The hash could look like: #file=https://...&share=0
    // We strip the '#' and parse as URLSearchParams
    const paramsString = route.hash.substring(1)
    const params = new URLSearchParams(paramsString)

    // Some older embeds might not use proper URL encoding for the & inside the file URL,
    // but URLSearchParams usually handles standard cases.
    let file = params.get("file")

    // Fallback: manually parse everything after "file=" up to the first "&share=" or similar
    if (!file) {
      const match = paramsString.match(/file=([^&]+)/)
      if (match) file = match[1]
    }

    if (file) {
      audioUrl.value = decodeURIComponent(file)
    }
  }
  // Case 2: The hash was URL encoded (%23) in the iframe src, causing Nuxt to see it as part of the path
  else if (route.params.slug) {
    const slugArray = Array.isArray(route.params.slug)
      ? route.params.slug
      : [route.params.slug]
    const fullSlug = slugArray.join("/")

    if (fullSlug.includes("#file=") || fullSlug.includes("%23file=")) {
      const parts = fullSlug.split(/#file=|%23file=/)
      if (parts.length > 1) {
        const fileString = parts[1].split("&")[0]
        if (fileString) {
          audioUrl.value = decodeURIComponent(fileString)
        }
      }
    }
  }
})
</script>

<template>
  <div class="ondemand-player-widget">
    <audio v-if="audioUrl" :src="audioUrl" controls class="w-full"></audio>
    <div v-else class="text-center p-3 text-500 text-sm">Audio player unavailable</div>
  </div>
</template>

<style scoped>
.ondemand-player-widget {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  background-color: transparent;
  margin: 0;
  padding: 0;
}
audio {
  width: 100%;
  max-width: 100%;
  outline: none;
}
</style>

<style>
/* Reset body margin/padding for this specific route */
html,
body {
  margin: 0 !important;
  padding: 0 !important;
  background-color: transparent !important;
  overflow: hidden;
}
</style>
