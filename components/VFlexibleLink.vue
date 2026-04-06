<script setup>
import { computed, useAttrs } from "vue"

defineOptions({
  inheritAttrs: false,
})

const allAttrs = useAttrs()

const props = defineProps({
  /**
   * pass through and not render link visuals
   */
  raw: {
    default: false,
    type: Boolean,
  },
  /**
   * raw hover style
   */
  rawHover: {
    default: "none",
    type: String,
  },
  /**
   * link target value
   */
  target: {
    default: "_blank",
    type: String,
  },
  /**
   * url or slug or anchor to go to
   */
  to: {
    default: null,
    type: String,
  },
  /**
   * url or slug or anchor to go to
   */
  tabIndexNumber: {
    default: 0,
    type: Number,
  },
  /**
   * radius on the link
   */
  radius: {
    default: "2px",
    type: String,
  },
  /**
   * radius on the link
   */
  wordBreak: {
    default: "normal",
    type: String,
  },
})

const emit = defineEmits(["flexible-link-click"])

const isExternal = computed(() => {
  const route = props.to?.trim()
  const reg = /^https?:\/\/|mailto:|tel:/i
  return typeof route === "string" && reg.test(route)
})
const isAnchor = computed(() => {
  return props.to.charAt(0) === "#"
})

/**
 * Merge custom CSS variables for radius/wordBreak/rawHover with any
 * style coming from $attrs. Using CSS custom properties instead of
 * scoped v-bind() avoids the SSR style serialization mismatch.
 */
/**
 * Filter $attrs to only pass safe HTML attributes to link elements.
 * Prevents image-specific attrs (srcset, size, quality, etc.) from
 * being dumped onto <a>/<nuxt-link> tags as invalid HTML attributes.
 * Also includes CSS custom properties for radius/wordBreak/rawHover
 * as the style property when they differ from defaults.
 */
const safeAttrs = computed(() => {
  const result = {}
  const skip = new Set([
    'class', 'style', // handled explicitly
    'src', 'srcset', 'srcFallback', 'srcSq', 'size',
    'width', 'height', 'quality', 'format', 'modifiers',
    'provider', 'density', 'densities', 'sizes', 'ratio',
    'loading', 'decoding', 'ismap', 'maxWidth', 'maxHeight',
    'allowPreview', 'allowVerticalEffect', 'isDecorative',
    'verticalBgGrayscale', 'flatQuality', 'defaultWidth',
    'heightToken', 'widthToken', 'qualityToken', 'alt',
  ])
  for (const key in allAttrs) {
    if (!skip.has(key)) {
      result[key] = allAttrs[key]
    }
  }
  // Add CSS custom properties as style when they differ from defaults
  const vars = {}
  if (props.radius !== '2px') vars['--flexible-link-radius'] = props.radius
  if (props.wordBreak !== 'normal') vars['--flexible-link-word-break'] = props.wordBreak
  if (props.rawHover !== 'none') vars['--flexible-link-raw-hover'] = props.rawHover
  if (Object.keys(vars).length > 0) {
    result.style = vars
  }
  return result
})
</script>

<template>
  <div
    v-if="!to"
    class="flexible-link null inline"
    :class="allAttrs.class"
    v-bind="safeAttrs"
    @click="emit('flexible-link-click', to)"
  >
    <slot name="default"></slot>
  </div>
  <a
    v-else-if="isExternal"
    :href="to"
    :target="target"
    :rel="`noopener ${props.target === '_blank' ? 'noreferrer' : ''}`"
    class="flexible-link external"
    :class="[{ ['raw']: raw }, allAttrs.class]"
    v-bind="safeAttrs"
    @click="emit('flexible-link-click', to)"
    :tabIndex="tabIndexNumber"
  >
    <slot name="default"></slot>
  </a>
  <a
    v-else-if="isAnchor"
    :href="to"
    target="_self"
    class="flexible-link anchor"
    :class="[{ ['raw']: raw }, allAttrs.class]"
    v-bind="safeAttrs"
    @click="emit('flexible-link-click', to)"
    :tabIndex="tabIndexNumber"
  >
    <slot name="default"></slot>
  </a>
  <nuxt-link
    v-else
    class="flexible-link internal"
    :class="[{ ['raw']: raw }, allAttrs.class]"
    :to="to"
    v-bind="safeAttrs"
    @click="emit('flexible-link-click', to)"
    :tabIndex="tabIndexNumber"
  >
    <slot name="default"></slot>
  </nuxt-link>
</template>
<style lang="scss" scoped>
.flexible-link {
  border-radius: var(--flexible-link-radius, 2px);
  word-break: var(--flexible-link-word-break, normal);
}
.flexible-link:not(.raw):not(.null) {
  color: var(--link-button-color);
  transition: all var(--p-transition-duration);
  * {
    transition: all var(--p-transition-duration);
  }
  &:hover {
    color: var(--link-button-hover-color);
    text-decoration: var(--link-button-text-hover-decoration);
    * {
      color: var(--link-button-hover-color);
      text-decoration: var(--link-button-text-hover-decoration);
    }
  }
  &:focus {
    outline-color: var(--p-focus-ring-color);
    outline-offset: var(--p-focus-ring-offset);
    box-shadow: var(--p-focus-ring-shadow);
    outline-style: var(--p-focus-ring-style);
  }
}
.flexible-link.null {
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: none;
  }
}
.flexible-link.raw {
  color: inherit;
  text-decoration: none;
  line-height: 0;
  &:hover,
  *:hover {
    text-decoration: var(--flexible-link-raw-hover, none);
  }
}
</style>
