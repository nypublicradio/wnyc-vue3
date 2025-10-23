<script setup>
import { computed } from "vue"

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

const radius = ref(props.radius)

const isExternal = computed(() => {
  const route = props.to?.trim()
  const reg = /^https?:\/\/|mailto:|tel:/i
  return typeof route === "string" && reg.test(route)
})
const isAnchor = computed(() => {
  return props.to.charAt(0) === "#"
})
</script>

<template>
  <div
    v-if="!to"
    class="flexible-link null inline"
    v-bind="{ ...$attrs }"
    @click="emit('flexible-link-click', to)"
  >
    <slot name="default"></slot>
  </div>
  <a
    v-else-if="isExternal"
    v-bind="{ ...$props, ...$attrs }"
    :href="to"
    :target="target"
    :rel="`noopener ${props.target === '_blank' ? 'noreferrer' : ''}`"
    class="flexible-link external"
    :class="{ ['raw']: raw }"
    @click="emit('flexible-link-click', to)"
    :tabIndex="tabIndexNumber"
  >
    <slot name="default"></slot>
  </a>
  <a
    v-else-if="isAnchor"
    v-bind="{ ...$props, ...$attrs }"
    :href="to"
    target="_self"
    class="flexible-link anchor"
    :class="{ ['raw']: raw }"
    @click="emit('flexible-link-click', to)"
    :tabIndex="tabIndexNumber"
  >
    <slot name="default"></slot>
  </a>
  <nuxt-link
    v-else
    class="flexible-link internal"
    :class="{ ['raw']: raw }"
    :to="to"
    v-bind="{ ...$attrs }"
    @click="emit('flexible-link-click', to)"
    :tabIndex="tabIndexNumber"
  >
    <slot name="default"></slot>
  </nuxt-link>
</template>
<style lang="scss" scoped>
.flexible-link {
  border-radius: v-bind(radius);
  word-break: v-bind(wordBreak);
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
  &:hover,
  *:hover {
    text-decoration: v-bind(rawHover);
  }
}
</style>
