<script lang="ts" setup>
const props = defineProps({
  connected: {
    type: Boolean,
    default: true,
  },
})

// ship init flag
let skipInit = true

// refreshNuxtData() is called when the network is re-cconnected
const refreshData = async () => {
  // refresh data here
  try {
    await refreshNuxtData()
  } catch (error) {
    console.error(error)
  }
}

const bgColor = ref(props.connected ? "var(--success)" : "var(--error)")
const shouldFadeIn = ref(false)

watch(
  () => props.connected,
  (newValue) => {
    // skip initial connected banner if its connected
    if (skipInit && newValue) {
      skipInit = false
      bgColor.value = newValue ? "var(--success)" : "var(--error)"
      shouldFadeIn.value = false
      return
    }
    bgColor.value = newValue ? "var(--success)" : "var(--error)"
    if (newValue) {
      shouldFadeIn.value = true
      setTimeout(() => {
        if (newValue) shouldFadeIn.value = false
      }, 4000)
      refreshData()
    } else {
      shouldFadeIn.value = true
    }
  },
  { immediate: true }
)
</script>

<template>
  <div
    class="network-banner flex justify-content-center"
    :class="[{ fadein: shouldFadeIn }]"
  >
    <div class="bar flex align-items-center justify-content-center">
      <i :class="`pi ${props.connected ? 'pi-check' : 'pi-exclamation-triangle'} mr-1`" />
      {{ props.connected ? "YOU ARE ONLINE" : "YOU ARE OFFLINE" }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.network-banner {
  pointer-events: none;
  position: fixed;
  top: env(safe-area-inset-top);
  width: 100%;
  z-index: 5000;
  opacity: 0;
  transition: opacity 1s;
  .pi {
    font-size: 0.6rem;
    line-height: 0.2rem;
  }
  &.fadein {
    opacity: 1;
  }
  .bar {
    padding: 2px $padding;
    background-color: v-bind(bgColor);
    font-weight: bold;
    font-size: 0.6rem;
    color: var(--black-500);
  }
}
</style>
