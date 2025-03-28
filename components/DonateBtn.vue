<script lang="ts" setup>
import { trackClickEvent } from "~/utilities/helpers"
const { donateButtonData } = await useNavigationData()

const props = defineProps({
  trackingLocation: {
    type: String,
    default: "Header",
  },
})
</script>
<template>
  <VFlexibleLink v-if="donateButtonData.buttonText" raw :to="donateButtonData.buttonLink" @flexible-link-click="
    trackClickEvent(
      `Click Tracking - ${donateButtonData.buttonText} Button`,
      props.trackingLocation,
      `${donateButtonData.buttonText} Button`
    )
    ">
    <Button :label="donateButtonData.buttonText" :aria-label="`${donateButtonData.buttonText} donate`"
      class="px-3 sm:px-5" />
  </VFlexibleLink>
</template>
