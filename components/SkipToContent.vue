<script setup lang="ts">
// Ref to track the focus state of the skip link
const isFocused = ref(false)

// Function to handle the click event and programmatically focus the main content
function skipToContent() {
  // Find the main content element by its ID
  const mainContent = document.getElementById("main-content")
  if (mainContent) {
    // Ensure the target can receive focus (important for elements like divs)
    if (mainContent.getAttribute("tabindex") === null) {
      mainContent.setAttribute("tabindex", "-1") // Make it focusable programmatically
    }
    // Set focus to the main content area
    mainContent.focus()
  }
}
</script>

<template>
  <a
    href="#main-content"
    @click.prevent="skipToContent"
    @focus="isFocused = true"
    @blur="isFocused = false"
    class="skip-link p-button p-button-secondary"
    :class="[{ 'is-focused': isFocused }]"
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
  text-decoration: none;

  p {
    font-weight: 600;
    margin: 0;
    color: var(--p-secondary-text-color);
  }

  outline: none;

  clip: rect(1px, 1px, 1px, 1px);
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;

  &.is-focused,
  &:focus {
    clip: auto;
    width: auto;
    height: auto;
    margin: 0;
    overflow: visible;
  }
}
</style>
