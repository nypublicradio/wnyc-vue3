<template>
  <div class="sound-wave">
    <div class="preload">
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
      <div class="bar"></div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sound-wave {
  .preload {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1px;
    overflow: hidden;
  }

  .bar {
    background: #ffffff;
    bottom: 1px;
    height: 3px;
    position: relative;
    width: 2px;
    animation: sound 0ms -800ms linear infinite alternate;
    border-radius: 2px;
  }

  @keyframes sound {
    0% {
      opacity: 0.35;
      height: 3px;
    }
    100% {
      opacity: 1;
      height: 13px;
    }
  }

  .bar:nth-child(1) {
    animation-duration: 474ms;
  }

  .bar:nth-child(2) {
    animation-duration: 433ms;
  }

  .bar:nth-child(3) {
    animation-duration: 407ms;
  }

  .bar:nth-child(4) {
    animation-duration: 458ms;
  }

  .bar:nth-child(5) {
    animation-duration: 400ms;
  }

  .bar:nth-child(6) {
    animation-duration: 427ms;
  }

  ​ .emptyBar {
  }

  .preload-finish {
    opacity: 0;
    pointer-events: none;
  }
  &.paused {
    .bar {
      animation-play-state: paused;
    }
  }
}
</style>
