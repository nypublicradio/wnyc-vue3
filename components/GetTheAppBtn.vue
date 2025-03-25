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
})
</script>
<template>
  <VFlexibleLink
    class="get-the-app-btn"
    raw
    to="/mobile"
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
        <DevicesIcon />
      </template>
    </Button>
  </VFlexibleLink>
</template>
