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
    <a
      v-for="(item, index) in props.data"
      :key="index"
      :href="item.value?.profile_url"
      :aria-label="`WNYC on ${item.value?.service}`"
      target="blank"
      rel="noopener noreferrer"
      class="p-button p-button-secondary p-button-icon-only p-button-rounded p-button-lg"
      @click="
        () => {
          trackClickEvent(
            `Click Tracking - ${item.value?.service} social Button`,
            'footer',
            `${item.value?.service} social Button`
          )
        }
      "
    >
      <span :class="`pi pi-${getServiceIcon(item.value?.service)}`" aria-hidden="true"></span>
    </a>
  </div>
</template>

<style lang="scss" scoped>
.social-buttons {
  a.p-button-rounded:focus-visible {
    border-radius: 50%;
  }
  a {
    text-decoration: none;
    width: 30px;
    height: 30px;
  }
  a > .pi {
    font-size: 18px;
  }
  a:focus-visible {
    border-radius: 4px;
  }
}
</style>
