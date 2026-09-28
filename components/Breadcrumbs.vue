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
const router = useRouter()

const lastItem = computed(() => {
  return props.items.length > 0 ? props.items[props.items.length - 1] : null
})

const parentItem = computed(() => {
  return props.items.length > 1 ? props.items[props.items.length - 2] : null
})

// True when the user reached this page by navigating within the app.
// `history.state.back` is null only at a true entry point (deep link,
// share link, hard refresh, cold app start).
const hasInAppHistory = () =>
  import.meta.client && window.history.state?.back != null

// Smart back: pop real history when we have it (returns to wherever the user
// actually came from and can't loop), otherwise fall back to the breadcrumb
// parent so a directly-opened page still lands somewhere sensible.
const routeBack = () => {
  trackClickEvent(
    "Click Tracking - Back Button",
    `${lastItem.value?.label} breadcrumbs`,
    "route back"
  )
  if (hasInAppHistory()) {
    router.back()
  } else {
    navigateTo(parentItem.value?.route || "/home")
  }
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
  <Breadcrumb v-else :model="items">
    <template #item="{ item }">
      <NavButton
        v-if="item.route && item.label"
        size="small"
        :label="item.label"
        :trackingLocation="`${lastItem?.label} breadcrumbs`"
        :route="item.route"
      />
      <span v-else-if="item.label" class="text-sm">{{ item.label }}</span>
    </template>
    <template #separator>/</template>
  </Breadcrumb>
</template>

<style lang="scss">
.p-breadcrumb {
  overflow: visible;
}
.p-breadcrumb ol {
  padding-left: 0;
  //overflow-x: auto;
  // hide the scrollbar
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.p-breadcrumb li {
  white-space: nowrap;
  flex: none;
  a {
    &:focus-visible,
    &:focus {
      @include focus-ring-defaults;
    }
  }
  &:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
.p-breadcrumb button {
  padding: 0;
  overflow: inherit !important;
}

@include media("<md") {
  .p-breadcrumb {
    width: 100%;
    //overflow: hidden;
  }

  .p-breadcrumb ol {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    width: 100%;
    min-width: 0;
  }

  .p-breadcrumb .p-breadcrumb-item,
  .p-breadcrumb .p-breadcrumb-separator {
    flex: 0 0 auto;
  }

  .p-breadcrumb .p-breadcrumb-item:last-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  .p-breadcrumb .p-breadcrumb-item:last-child .nav-button {
    display: block;
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .p-breadcrumb .p-breadcrumb-item:last-child .nav-button .p-button {
    width: 100%;
    min-width: 0;
    justify-content: flex-start;
    overflow: hidden !important;
  }

  .p-breadcrumb .p-breadcrumb-item:last-child .nav-button .p-button-label {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
