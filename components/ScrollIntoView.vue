<script setup>
import { onMounted, ref } from "vue"

const props = defineProps({
  /**
   * Scroll behavior: 'smooth' for animated scroll, 'instant' for immediate
   */
  behavior: {
    type: String,
    default: "smooth",
    validator: (value) => ["smooth", "instant", "auto"].includes(value),
  },
  /**
   * Vertical alignment: 'start', 'center', 'end', 'nearest'
   */
  block: {
    type: String,
    default: "nearest",
    validator: (value) => ["start", "center", "end", "nearest"].includes(value),
  },
  /**
   * Horizontal alignment: 'start', 'center', 'end', 'nearest'
   */
  inline: {
    type: String,
    default: "nearest",
    validator: (value) => ["start", "center", "end", "nearest"].includes(value),
  },
  /**
   * Delay before scrolling (in milliseconds)
   */
  delay: {
    type: Number,
    default: 100,
  },
})

const elementRef = ref(null)

const scrollIntoView = () => {
  if (elementRef.value) {
    elementRef.value.scrollIntoView({
      behavior: props.behavior,
      block: props.block,
      inline: props.inline,
    })
  }
}

onMounted(() => {
  // Use a small delay to ensure the element is fully rendered
  setTimeout(scrollIntoView, props.delay)
})

// Expose the scroll method for manual triggering if needed
defineExpose({
  scrollIntoView,
})
</script>

<template>
  <div ref="elementRef">
    <slot />
  </div>
</template>
