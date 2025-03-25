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
</script>
<template>
  <VFlexibleLink
    class="listen-live-btn"
    raw
    to="/live"
    @flexible-link-click="
      trackClickEvent(
        `Click Tracking - ${props.label} Button`,
        props.trackingLocation,
        `${props.label} Button`
      )
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
