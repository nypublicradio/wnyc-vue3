<script setup>
import { useIsApp } from "~/composables/states"
import { trackClickEvent } from "~/utilities/helpers"

const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})

const isApp = useIsApp()

const lastItem = computed(() => {
  return props.items.length > 0 ? props.items[props.items.length - 1] : null
})

// navigate back to the parent page and track it
const routeBack = () => {
  trackClickEvent(
    "Click Tracking - Back Button",
    `${lastItem?.label} breadcrumbs`,
    "route back"
  )
  navigateTo(lastItem.value?.route || "/home")
}
</script>

<template>
  <Button
    v-if="isApp"
    class="back-btn text-color -ml-3"
    icon="pi pi-chevron-left"
    rounded
    text
    severity="secondary"
    aria-label="back to previous page"
    @click="routeBack"
    label="Back"
  />
  <Breadcrumb v-else :model="items" class="hidden xs:block">
    <template #item="{ item }">
      <NavButton
        v-if="item.route && item.label"
        size="small"
        :label="item.label"
        :trackingLocation="`${lastItem?.label} breadcrumbs`"
        :route="item.route"
      />
    </template>
    <template #separator>/</template>
  </Breadcrumb>
</template>

<style lang="scss">
.p-breadcrumb ol {
  padding-left: 0;
}
.p-breadcrumb button {
  padding: 0;
  overflow: inherit !important;
}
</style>
