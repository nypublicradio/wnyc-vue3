<script setup>
const props = defineProps({
  size: {
    type: String,
    default: '100%',
  },
  bg: {
    type: Boolean,
    default: false,
  },
  spinner: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'var(--primary-color)',
  },
})
</script>

<template>
  <div class="wnyc-loader" :class="[{ bg: props.bg, spinner: props.spinner }]">
    <div class="svg-holder flex">
      <i
        v-if="props.spinner"
        class="pi pi-spin pi-spinner"
        :style="`font-size: ${props.size}; color: ${props.color};`"
      ></i>
      <svg v-else class="svg" x="0px" y="0px" viewBox="0 0 75.1 30">
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
  &.bg {
    background: -moz-radial-gradient(
      center,
      ellipse cover,
      rgba(rgb(222, 30, 61), 0.3) 0%,
      rgba(rgb(222, 30, 61), 0) 100%
    );
    background: -webkit-radial-gradient(
      center,
      ellipse cover,
      rgba(rgb(222, 30, 61), 0.3) 0%,
      rgba(rgb(222, 30, 61), 0) 100%
    );
    background: radial-gradient(
      ellipse at center,
      rgba(rgb(222, 30, 61), 0.3) 0%,
      rgba(rgb(222, 30, 61), 0) 100%
    );
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#ffffff', endColorstr='#00ffffff',GradientType=1 );
  }

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
    .pi-spinner {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      right: 0;
      margin: auto;
      width: v-bind(size);
      height: v-bind(size);
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
.style-mode-dark .wnyc-loader {
  &.bg {
    background: -moz-radial-gradient(
      center,
      ellipse cover,
      rgba(rgb(255, 255, 255), 0.3) 0%,
      rgba(rgb(255, 255, 255), 0) 100%
    );
    background: -webkit-radial-gradient(
      center,
      ellipse cover,
      rgba(rgb(255, 255, 255), 0.3) 0%,
      rgba(rgb(255, 255, 255), 0) 100%
    );
    background: radial-gradient(
      ellipse at center,
      rgba(rgb(255, 255, 255), 0.3) 0%,
      rgba(rgb(255, 255, 255), 0) 100%
    );
  }
  .svg-holder .svg .st1 {
    fill: #ffffff;
  }
}
</style>
