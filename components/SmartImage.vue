<script setup>
import VImagePublisher from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VImagePublisher'
import {
  formatPublisherImageUrl,
  getAviaryImageSrcId,
} from '~/utilities/helpers'
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  /**
   * allow the user to click on the enlarge button to open a dialogue with full sized image */
  allowPreview: {
    default: false,
    type: Boolean,
  },
  /**
   * allow the vertical effect to happen for vertical images (images that are taller than they are wide)
   */
  allowVerticalEffect: {
    default: false,
    type: Boolean,
  },
  /**
   * alt text for the image
   */
  alt: {
    default: '',
    type: String,
  },
  /** * bool to NOT use the variable quality calc based on sizes */
  flatQuality: {
    default: false,
    type: Boolean,
  },
  /**
   * nuxt/image sizes attribute for responsive images (https://image.nuxtjs.org/components/nuxt-img/#sizes)
   * NOT WORKING
   */
  density: {
    default: 'x1 x2',
    type: String,
  },
  /**
   * The desired height for image
   */
  height: {
    default: null,
    type: Number,
  },
  /** * Substring or regex within the url to be replaced with height values. */
  heightToken: {
    default: '%height%',
    type: [String, RegExp],
  },
  /**
   * to help with a11y
   */
  isDecorative: {
    default: false,
    type: Boolean,
  },
  /**
   * image loading type (eager or lazy)
   */
  loading: {
    default: 'lazy',
    type: String,
  },
  /**
   * Maximum height for the image. If you know the height of the original, full-sized image, use it here. It is needed for the vertical effect
   */
  maxHeight: {
    default: Infinity,
    type: Number,
  },
  /**
   * Maximum width for the image. If you know the width of the original, full-sized image, use it here. It is needed for the vertical effect
   */
  maxWidth: {
    default: Infinity,
    type: Number,
  },
  /**
   * wagtail modifiers  (https://image.nuxtjs.org/components/nuxt-img/#modifiers
   * ONLY WORKS WITH WAGTAIL PROVIDER and only supporting 'focusZoom'
   */
  modifiers: {
    default: null,
    type: Object,
  },
  /**
   * @nuxt/Image provider
   */
  provider: {
    default: 'wagtail',
    type: String,
  },
  /**
   * compression quality of the iamge
   */
  quality: {
    default: 80,
    type: Number,
  },
  /** * Substring or regex within the url to control jpg compression quality. */
  qualityToken: {
    default: '%quality%',
    type: [String, RegExp],
  },
  /**
   * desired ratio of the image
   */
  ratio: {
    default: () => [3, 2],
    type: Array,
  },
  /**
   * nuxt/image sizes attribute for responsive images (https://image.nuxtjs.org/components/nuxt-img/#sizes)
   */
  sizes: {
    default: null,
    type: [String, Array],
  },
  /**
   * wagtail image id
   */
  src: {
    default: null,
    type: [String, Number],
  },
  /**
   * address to navigate to when the image is clicked
   */
  to: {
    default: null,
    type: String,
  },
  /**
   *  ammount of blur for the blured background image */
  verticalBgBlur: {
    default: '3px',
    type: String,
  },
  /**
   * tint the grey blured background image
   * */
  verticalBgColor: {
    default: '#f1f1f1',
    type: String,
  },
  /**
   *  the opacity of the tint of the grey blured background image
   */
  verticalBgColorOpacity: {
    default: '0.6',
    type: String,
  },
  /**
   * The desired width for image
   */
  width: {
    default: null,
    type: Number,
  },
  /** * Substring or regex within the urlto be replaced with width values. */
  widthToken: {
    default: '%width%',
    type: [String, RegExp],
  },
})
const emit = defineEmits([
  'image-click',
  'image-enlarge-click',
  'image-load',
  'enlarge-image-load',
])

//const emit = defineEmits(["change", "click"]);

// lifecycle hooks
onMounted(() => {})
</script>

<template>
  <div class="smart-image">
    <VImage
      :src="getAviaryImageSrcId(props.src)"
      :width="props.width"
      :height="props.height"
      :ratio="props.ratio"
    />
    <VImagePublisher
      :src="formatPublisherImageUrl(props.src.attributes.imageMain.template)"
      :width="props.width"
      :height="props.height"
      :ratio="props.ratio"
    />
  </div>
</template>

<style lang="scss" scoped>
.smart-image {
}
</style>
