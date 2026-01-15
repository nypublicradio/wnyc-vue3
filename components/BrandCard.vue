<script setup>
const props = defineProps({
  brand: {
    type: Object,
    required: true,
  },
})

// route to the show page and add query
const selectBrand = (brand) => {
  // open up a new tab to the brand.url
  window.open(brand.url, "_blank")
}
</script>

<template>
  <div class="relative brand-card">
    <Button
      class="brand-btn text-lg"
      :label="props.brand.label"
      :aria-label="`${props.brand.label} brand button`"
      @click="selectBrand(props.brand)"
      :style="`background-image: url(${props.brand.image}); background-color: ${props.brand.color};`"
      :title="props.brand.label"
    >
      <img
        v-if="props.brand.svg"
        :src="props.brand.svg"
        :alt="`${props.brand.label}logo`"
        class="logo absolute w-9 max-h-4rem"
        :class="props.brand.value"
      />
    </Button>
  </div>
</template>

<style lang="scss" scoped>
.brand-card {
  .brand-btn {
    font-family: var(--font-family-header);
    width: 100%;
    height: 100px;
    border-radius: 16px;
    border: none;
    background-size: cover;
    background-position: center;
    transition: transform var(--p-transition-duration),
      opacity var(--p-transition-duration);
    -webkit-transition: transform var(--p-transition-duration),
      opacity var(--p-transition-duration) // , box-shadow var(--p-transition-duration)
;
    &:hover {
      transform: scale(1.05);
      // -webkit-box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.15);
      // box-shadow: 0 0 10px 2px rgba(0, 0, 0, 0.15);
    }
    .logo {
      &.gothamist {
        width: 66% !important;
      }
    }
    @include media(">=xl") {
      background-color: var(--p-surface-25) !important;
      background-image: none !important;
      .logo {
        filter: brightness(0);
        &.on-the-media {
          filter: grayscale(1) brightness(1) contrast(1.25);
        }
      }
    }
  }
}
</style>
