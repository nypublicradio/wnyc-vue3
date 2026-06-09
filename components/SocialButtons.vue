<script setup>
import { trackClickEvent } from "~/utilities/helpers"

const props = defineProps({
  label: {
    type: String,
    default: "Connect with us!",
  },
  data: {
    type: Array,
    default: () => [],
  },
})
</script>
<template>
  <div class="social-buttons flex gap-3 align-items-center flex-wrap">
    <p v-if="props.label" class="text-sm">{{ props.label }}</p>
    <VFlexibleLink
      v-for="item in props.data"
      raw
      :to="item.url"
      :key="item.id"
      radius="50px"
      :title="item.label"
      :aria-label="`${item.label} social Button`"
      @flexible-link-click="
        () => {
          trackClickEvent(
            `Click Tracking - ${item.label} social Button`,
            'footer',
            `${item.label} social Button`
          )
        }
      "
    >
      <Button
        :icon="item.icon"
        severity="secondary"
        size="large"
        rounded
        tabindex="-1"
        :aria-label="item.label"
        aria-hidden="true"
      />
    </VFlexibleLink>
  </div>
</template>

<style lang="scss" scoped>
.social-buttons {
  .p-button {
    width: 30px;
    height: 30px;
  }
}
</style>
