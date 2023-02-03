<script setup>  
const props = defineProps({
  label: {
    type: String,
    default: '',
  },
})
</script>
  
<template>
  <div class="live-indicator">
    <div class="live-indicator-wrapper">
      <span class="live-indicator-live-text mr-2">Live</span>
      <div class="relative mr-1">
        <span class="live-indicator-dot absolute" />
        <span class="live-indicator-dot-pulse absolute" />
      </div>
    </div>
    <span class="live-indicator-label">{{ label }}</span>
  </div>
</template>
  
<style lang="scss">
.live-indicator {
  display: flex;
  align-items: center;
  font-size: var(--font-size-4);
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.live-indicator .live-indicator-wrapper {
  display: flex;
  align-items: center;
  background-color: var(--white);
  border-radius: 3px;
  padding: 1px 6px;
  margin-right: 0.6rem;
}

.live-indicator .live-indicator-live-text {
  color: var(--black);
  margin-right: 0.25rem;
}

.live-indicator .live-indicator-dot {
  height: 8px;
  width: 8px;
  background: var(--red);
  border-radius: 50%;
  top: -4px;
  left: -4px;
}

.live-indicator .live-indicator-dot-pulse {
  height: 16px;
  width: 16px;
  border: 3px solid var(--red);
  border-radius: 50%;
  animation: pulsate 2s ease-out;
  animation-iteration-count: infinite;
  opacity: 0;
  top: -8px;
  left: -8px;
}

@keyframes pulsate {
  0% {
    -webkit-transform: scale(0.1, 0.1);
    opacity: 0;
  }
  50% {
    opacity: 0.75;
  }
  100% {
    -webkit-transform: scale(1, 1);
    opacity: 0;
  }
}
</style>
  