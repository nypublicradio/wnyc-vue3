<script setup>
const props = defineProps({
  data: {
    type: Object,
    default: null,
  },
  buffer: {
    type: String,
    default: "40px",
  },
})
const { isMobile } = useDevice()
const reactiveData = toRef(props, "data")
</script>

<template>
  <div class="horizontal-scroll-feature">
    <div
      class="scroll flex gap-2 align-items-stretch"
      :class="[{ hideScrollBar: isMobile }]"
    >
      <slot name="default" v-if="reactiveData" />
      <slot v-else name="skeleton">
        <div class="flex w-full">
          <div v-for="i in 5" class="item" :key="`${i}-skeleton`">
            <Skeleton
              class="flex-none btn"
              height="33.16px"
              width="120px"
              borderRadius="20px"
            />
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.horizontal-scroll-feature {
  background: transparent;
  position: relative;
  .scroll {
    padding: 6px $padding 16px 0;
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
    &.hideScrollBar {
      padding-bottom: 0;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
<style lang="scss">
.horizontal-scroll-feature {
  .scroll {
    .item {
      &:first-child {
      }
      &:not(.large-card):last-child {
        @include media("<md") {
          margin-right: 3rem;
        }
      }
      &.large-card:last-child {
        @include media("<md") {
          margin-right: 3rem;
        }
      }
      &.btn,
      .btn {
        margin-left: 1.5rem;
      }
    }
  }
}
</style>
