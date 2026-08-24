<script setup>
const props = defineProps({
  brand: {
    type: Object,
    required: true,
  },
})

// route to the show page and add query
const selectBrand = (brand) => {
  // if the brand.url starts with http
  if (brand.url.startsWith("http")) {
    // open up a new tab to the brand.url
    window.open(brand.url, "_blank")
  } else {
    // route to the show page and add query
    navigateTo(brand.url)
  }
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
        loading="lazy"
      />
    </Button>
  </div>
</template>

<style lang="scss" scoped>
@mixin greyEffect {
  background-color: var(--p-surface-25) !important;
  background-image: none !important;
  .logo {
    filter: brightness(0);
    &.on-the-media {
      filter: grayscale(1) brightness(1) contrast(1.25);
    }
  }
}
.brand-card {
  .brand-btn {
    font-family: var(--font-family-header);
    width: 100%;
    height: 100px;
    border-radius: 16px;
    border: none;
    background-size: cover;
    background-position: center;
    transition: all var(--p-transition-duration);
    -webkit-transition: all var(--p-transition-duration);
    &:hover {
      transform: scale(1.05);
    }
    .logo {
      transition: filter var(--p-transition-duration);
      &.gothamist {
        width: 66% !important;
      }
    }
    @include media(">=xl") {
      html:not(.style-mode-dark) & {
        &:not(:hover) {
          @include greyEffect;
        }
      }
    }
  }
}
</style>
