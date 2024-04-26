<script setup>
const props = defineProps({
  size: {
    type: String,
    default: "100%",
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
    default: "var(--text-color)",
  },
  svgXscale: {
    type: Number,
    default: 1,
  },
  svgYscale: {
    type: Number,
    default: 1,
  },
  bars: {
    type: Number,
    default: 4,
  },
  gap: {
    type: Number,
    default: 0.65,
  },
  paused: {
    type: Boolean,
    default: false,
  },
})
const svgWidth = 75
</script>

<template>
  <div
    class="wnyc-loader"
    :class="[{ bg: props.bg, spinner: props.spinner, pause: props.paused }]"
    aria-label="loading and audio indicator"
  >
    <div class="svg-holder flex">
      <i
        v-if="props.spinner"
        class="pi pi-spin pi-spinner"
        :style="`font-size: ${props.size}; color: ${props.color};`"
        aria-label="spinning loader"
      ></i>
      <svg
        v-else
        class="svg"
        x="0px"
        y="0px"
        viewBox="0 0 75.1 30"
        aria-label="animated sound bars loader and/or audio is playing indicator"
      >
        <!-- <rect id="b4" x="58.1" y="22" class="st1" width="16.9" height="30" />
        <rect id="b3" x="38.7" y="22" class="st1" width="16.9" height="30" />
        <rect id="b2" x="19.4" y="22" class="st1" width="16.9" height="30" />
        <rect id="b1" x="0" y="22" class="st1" width="16.9" height="30" /> -->

        <rect
          v-for="(bar, index) in bars"
          :key="`loaderBar${index}`"
          :x="(svgWidth / bars + gap) * index"
          y="22"
          class="st1"
          width="16.9"
          height="30"
        />
      </svg>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wnyc-loader {
  display: flex;
  justify-content: center;
  &.bg {
    background: -moz-radial-gradient(
      center,
      ellipse cover,
      rgba(rgb(16, 16, 18), 0.3) 0%,
      rgba(rgb(16, 16, 18), 0) 100%
    );
    background: -webkit-radial-gradient(
      center,
      ellipse cover,
      rgba(rgb(16, 16, 18), 0.3) 0%,
      rgba(rgb(16, 16, 18), 0) 100%
    );
    background: radial-gradient(
      ellipse at center,
      rgba(rgb(16, 16, 18), 0.3) 0%,
      rgba(rgb(16, 16, 18), 0) 100%
    );
  }

  .svg-holder {
    position: relative;
    width: v-bind(size);
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
      transform: scalex(v-bind(svgXscale));
      transform: scaleY(v-bind(svgYscale));
      .st1 {
        animation: moveUpAndDown 2s infinite;
        transform-origin: top;
        fill: v-bind(color);
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
  &.pause {
    .svg-holder .svg .st1 {
      animation-play-state: paused;
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
