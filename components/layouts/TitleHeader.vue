<script setup>
import { getRouteOrLink } from "~/utilities/helpers"
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  seeMore: {
    type: Object,
    default: null,
    required: false,
  },
})
</script>

<template>
  <div>
    <div class="flex justify-content-between align-items-center mb-4">
      <h2>{{ props.label }}</h2>
      <VFlexibleLink v-if="props.seeMore" :to="getRouteOrLink(props.seeMore.url)">
        <Button
          severity="secondary"
          variant="link"
          class="link -mr-2 text-sm md:text-base no-underline"
          :label="props.seeMore.label"
          tabindex="-1"
        />
      </VFlexibleLink>
    </div>
  </div>
</template>
