<script setup>
const props = defineProps({
  size: {
    default: '100%',
    type: String,
  },
})
const size = ref(props.size)
</script>

<template>
  <div class="wnyc-loader">
    <div class="svg-holder">
      <svg class="svg" x="0px" y="0px" viewBox="0 0 75.1 30">
        <rect id="b4" x="38.7" y="22" class="st1" width="16.9" height="30" />
        <rect id="b3" x="58.1" y="22" class="st1" width="16.9" height="30" />
        <rect id="b2" x="19.4" y="22" class="st1" width="16.9" height="30" />
        <rect id="b1" x="0" y="22" class="st1" width="16.9" height="30" />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-loader {
  .svg-holder {
    position: relative;
    width: 100%;
    height: 100%;
    .svg {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      width: v-bind(size);
      height: auto;
      .st1 {
        animation: moveUpAndDown 2s infinite;
        transform-origin: top;
        fill: var(--primary-color, #de1e3d);
        transform: translateY(-30);
      }
    }
  }

  @keyframes moveUpAndDown {
    0% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-22px);
    }
    100% {
      transform: translateY(0px);
    }
  }

  $animationDuration: 1s;
  $staggerDelay: $animationDuration * 0.25;

  @for $i from 1 through 4 {
    .svg-holder .svg .st1:nth-child(#{$i}) {
      animation: moveUpAndDown $animationDuration infinite;
      animation-delay: $staggerDelay * ($i - 1) - 2;
    }
  }
}
</style>
<style lang="scss">
.style-mode-dark .wnyc-loader .svg-holder .svg .st1 {
  fill: #ffffff;
}
</style>
