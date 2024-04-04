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
  <div class="network-banner" :class="[{ fadeout: shouldFadeOut }]">
    <i :class="`pi ${props.connected ? 'pi-check' : 'pi-exclamation-triangle'} mr-1`" />
    {{ props.connected ? "NETWORK CONNETED" : "NETWORK DISCONNETED" }}
  </div>
</template>

<style lang="scss" scoped>
.network-banner {
  pointer-events: none;
  background-color: v-bind(bgColor);
  font-weight: bold;
  padding: 2px $padding;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  z-index: 5000;
  font-size: 0.6rem;
  color: var(--black-500);
  opacity: 1;
  transition: opacity 1s;
  .pi {
    font-size: 0.6rem;
  }
  &.fadeout {
    opacity: 0;
  }
}
</style>
