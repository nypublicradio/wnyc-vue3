<script setup>
defineOptions({ inheritAttrs: false })

const props = defineProps({
  src: { default: null, type: String },
  alt: { default: "", type: String },
  isDecorative: { default: false, type: Boolean },
  loading: { default: "lazy", type: String },
  width: { default: null, type: Number },
  height: { default: null, type: Number },
  ratio: { default: () => [1, 1], type: Array },
})

const emit = defineEmits(["image-load", "image-error"])
</script>

<template>
  <div class="v-image v-image-local">
    <div
      class="v-image-holder"
      :style="`aspect-ratio:${props.ratio[0]} / ${props.ratio[1]}`"
    >
      <img
        class="image"
        :src="props.src"
        :alt="props.isDecorative ? '' : props.alt"
        :loading="props.loading"
        :width="props.width ?? undefined"
        :height="props.height ?? undefined"
        @load="emit('image-load')"
        @error="emit('image-error')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.v-image {
  line-height: 0;
  position: relative;
  height: inherit;

  .v-image-holder {
    position: relative;
    overflow: hidden;
    height: inherit;

    .image {
      position: relative;
      width: 100%;
      height: 100%;
      top: 0;
      object-fit: cover;
    }
  }
}
</style>
