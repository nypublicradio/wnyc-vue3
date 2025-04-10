<script setup lang="ts">
const skipLink = ref<HTMLElement | null>(null)
const isFocused = ref(false)
onMounted(() => {
  if (skipLink.value) {
    skipLink.value.addEventListener("focus", () => {
      skipLink.value!.style.clip = "auto"
      isFocused.value = true
    })

    skipLink.value.addEventListener("blur", () => {
      skipLink.value!.style.clip = "rect(1px, 1px, 1px, 1px)"
      isFocused.value = false
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
  <a
    ref="skipLink"
    href="#main-content"
    @click="skipToContent"
    class="skip-link p-button p-button-secondary"
  >
    <p>Skip to Content</p>
  </a>
  <Transition name="fade">
    <div class="skip-to-content" v-if="isFocused"></div>
  </Transition>
</template>

<style lang="scss" scoped>
.skip-to-content {
  z-index: 1000;
  position: absolute;
  top: 0;
  left: 0;
  background-color: var(--p-mask-background);
  width: 100%;
  height: 100%;
}
.skip-link {
  z-index: 1001;
  position: absolute;
  top: 30px;
  left: 200px;
  clip: rect(1px, 1px, 1px, 1px);
  text-decoration: none;
  p {
    font-weight: 600;
    margin: 0;
  }
  outline: none;
}
</style>
