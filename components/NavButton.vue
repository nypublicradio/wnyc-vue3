<script lang="ts" setup>
import { trackClickEvent } from "~/utilities/helpers"
const props = defineProps({
  label: {
    type: String,
    default: "Get the App",
  },
  trackingLocation: {
    type: String,
    default: "Header",
  },
  route: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    default: "normal",
    validator: (value: string) => ["normal", "small", "large"].includes(value),
  },
})
const emit = defineEmits(["emit-click"])
</script>
<template>
  <VFlexibleLink
    class="get-the-app-btn"
    raw
    :to="props.route"
    @flexible-link-click="
      () => {
        emit('emit-click')
        trackClickEvent(
          `Click Tracking - ${props.label} Button`,
          props.trackingLocation,
          `${props.label} Button`
        )
      }
    "
  >
    <Button
      :label="props.label"
      :aria-label="`${props.label} button`"
      :size="props.size"
      variant="link"
      tabindex="-1"
    >
      <template #icon>
        <slot name="icon" />
      </template>
    </Button>
  </VFlexibleLink>
</template>
