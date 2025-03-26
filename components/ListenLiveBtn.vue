<script lang="ts" setup>
import { trackClickEvent } from "~/utilities/helpers"
const props = defineProps({
  label: {
    type: String,
    default: "Listen Live",
  },
  trackingLocation: {
    type: String,
    default: "Header",
  },
})
const emit = defineEmits(["emit-click"])
</script>
<template>
  <VFlexibleLink
    class="listen-live-btn"
    raw
    to="/live"
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
      size="small"
      variant="link"
    >
      <template #icon>
        <LiveLinesIcon />
      </template>
    </Button>
  </VFlexibleLink>
</template>
