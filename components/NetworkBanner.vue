<script lang="ts" setup>
const props = defineProps({
  connected: {
    type: Boolean,
    default: true,
  },
})

const bgColor = ref(props.connected ? "var(--success)" : "var(--error)")
const shouldFadeOut = ref(false)
watchEffect(() => {
  bgColor.value = props.connected ? "var(--success)" : "var(--error)"
  if (props.connected) {
    setTimeout(() => {
      shouldFadeOut.value = true
    }, 4000)
  } else {
    shouldFadeOut.value = false
  }
})
</script>

<template>
  <div
    class="network-banner flex justify-content-center"
    :class="[{ fadeout: shouldFadeOut }]"
  >
    <div class="bar flex align-items-center justify-content-center">
      <i :class="`pi ${props.connected ? 'pi-check' : 'pi-exclamation-triangle'} mr-1`" />
      {{ props.connected ? "NETWORK CONNECTED" : "NETWORK DISCONNECTED" }}
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
  opacity: 1;
  transition: opacity 1s;
  .pi {
    font-size: 0.6rem;
    line-height: 0.2rem;
  }
  &.fadeout {
    opacity: 0;
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
