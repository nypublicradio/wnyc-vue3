<script setup lang="ts">
const skipLink = ref<HTMLElement | null>(null)

onMounted(() => {
  if (skipLink.value) {
    skipLink.value.addEventListener("focus", () => {
      skipLink.value!.style.clip = "auto"
    })

    skipLink.value.addEventListener("blur", () => {
      skipLink.value!.style.clip = "rect(1px, 1px, 1px, 1px)"
    })
  }
})

function skipToContent() {
  const mainContent = document.getElementById("main-content")
  if (mainContent) {
    mainContent.focus()
  }
}
</script>

<template>
  <a ref="skipLink" href="#main-content" @click="skipToContent" class="skip-link">
    Skip to Content
  </a>
</template>

<style lang="scss" scoped>
.skip-link {
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  clip: rect(1px, 1px, 1px, 1px);
  padding: 1rem;
  background-color: #f0f0f0;
  border: 1px solid #ccc;
}
</style>
