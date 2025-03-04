<template>
  <span class="live-indicator relative">
    <span class="live-indicator-dot absolute" />
    <span class="live-indicator-dot-pulse absolute" />
  </span>
</template>

<style lang="scss">
.live-indicator {
  height: 6px;
  width: 6px;

  .live-indicator-dot {
    height: 6px;
    width: 6px;
    background: var(--p-red-500);
    border-radius: 50%;
  }

  .live-indicator-dot-pulse {
    height: 6px;
    width: 6px;
    border: 3px solid var(--p-red-500);
    border-radius: 50%;
    animation: pulsate 2s ease-out;
    animation-iteration-count: infinite;
    opacity: 0;
  }
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
    -webkit-transform: scale(2, 2);
    opacity: 0;
  }
}
</style>
