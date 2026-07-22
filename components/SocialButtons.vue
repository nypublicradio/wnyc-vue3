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
      v-for="(item, index) in props.data"
      raw
      :to="item.value?.profile_url"
      :key="index"
      radius="50px"
      :title="item.value?.service"
      @flexible-link-click="
        () => {
          trackClickEvent(
            `Click Tracking - ${item.value?.service} social Button`,
            'footer',
            `${item.value?.service} social Button`
          )
        }
      "
    >
      <Button
        :icon="`pi pi-${item.value?.service.toLowerCase()}`"
        severity="secondary"
        size="large"
        rounded
        tabindex="-1"
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
