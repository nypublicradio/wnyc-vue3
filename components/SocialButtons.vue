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

// if the service is "homepage", return "link", otherwise just return the service name in lowercase
const getServiceIcon = (service) => {
  if (service.toLowerCase() === "homepage") return "globe"
  return service.toLowerCase()
}
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
      :aria-label="`${item.label} social Button`"
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
        :icon="`pi pi-${getServiceIcon(item.value?.service)}`"
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
