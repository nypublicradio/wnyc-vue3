<script setup>
import VImageWithCaption from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImageWithCaption.vue'

const props = defineProps({
  role: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    default: null,
  },
  image: {
    type: String,
    default: 'https://media.wnyc.org/i/raw/2021/01/radio_avatar.png',
  },
  width: {
    type: Number,
    default: 90,
  },
  height: {
    type: Number,
    default: 90,
  },
  quality: {
    type: Number,
    default: 80,
  },
  borderRadius: {
    type: String,
    default: '100%',
  },
})

const maxWidthBind = ref(props.width + 'px')
const borderRadiusBind = ref(props.borderRadius)
</script>

<template>
  <div>
    <div
      class="host-card flex gap-3 align-items-center flex-column lg:flex-row"
    >
      <v-image-with-caption
        class="image"
        :image="props.image"
        :alt-text="`Photo of ${props.name}`"
        :ratio="[props.width, props.height]"
        role="presentation"
        loading="lazy"
        decoding="async"
        :width="props.width"
        :height="props.height"
      />
      <div class="info text-center lg:text-left">
        <h2 class="host-name">{{ props.name }}</h2>
        <p class="host-role">{{ props.role }}</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.host-card {
  .image {
    max-width: v-bind(maxWidthBind);
    border-radius: v-bind(borderRadiusBind);
    overflow: hidden;
  }
  .host-role {
    font-size: var(--font-size-4);
    text-transform: uppercase;
    font-weight: 700;
    letter-spacing: 1.14px;
  }
  .host-name {
    font-size: var(--font-size-7);
    font-family: var(--font-family);
    font-weight: 700;
    letter-spacing: normal;
    margin: 0;
    padding: 0;
  }
}
</style>
