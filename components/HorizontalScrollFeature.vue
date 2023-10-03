<template>
  <div class="horizontal-scroll-feature">
    <div class="scroll flex gap-3 align-items-stretch">
      <slot />
    </div>
  </div>
</template>

<style lang="scss">
.horizontal-scroll-feature {
  background: transparent;
  position: relative;
  .scroll {
    padding: 0 $padding 20px $padding;
    overflow-y: hidden;
    overflow-x: auto;
    scroll-behavior: smooth;
    -webkit-mask-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 1) 6%,
      rgba(0, 0, 0, 1) 94%,
      rgba(0, 0, 0, 0) 100%
    );
    mask-image: linear-gradient(
      to right,
      rgba(0, 0, 0, 0) 0%,
      rgba(0, 0, 0, 1) 6%,
      rgba(0, 0, 0, 1) 94%,
      rgba(0, 0, 0, 0) 100%
    );
    .card-large {
      height: 100%;
    }
  }
}
</style>
