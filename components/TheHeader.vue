<script setup>
import { trackClickEvent, getDate } from '~/utilities/helpers'
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'
import { useSettingSideBar } from '~/composables/states.ts'

const settingsSideBar = useSettingSideBar()
</script>

<template>
  <div class="the-header">
    <section class="full-width">
      <div class="flex justify-content-between align-items-center">
        <div class="flex align-items-center">
          <VFlexibleLink
            raw
            to="/home"
            class="mr-3"
            @flexible-link-click="
              trackClickEvent('Click Tracking - WNYC Logo', 'WNYC Logo', '/')
            "
          >
            <WnycLogo class="w-5rem" />
          </VFlexibleLink>
          <span class="font-meta">{{ getDate() }}</span>
        </div>
        <div class="flex">
          <!-- <VFlexibleLink
            raw
            to="https://pledge3.wnyc.org/donate/main/onestep/?utm_medium=partnersite&utm_source=w3k&utm_campaign=brandheader"
            @flexible-link-click="
              trackClickEvent(
                `Click Tracking - Header Donate Button`,
                'Header Donate Button',
                ''
              )
            "
          >
            <Button label="Donate" class="px-3 sm:px-5 mr-3" />
          </VFlexibleLink> -->

          <Button
            icon="pi pi-bars"
            class="p-button-text"
            severity="secondary"
            @click="
              () => {
                settingsSideBar = true
                trackClickEvent(
                  'Click Tracking - Hamburger Menu',
                  'Hamburger Menu',
                  `open sidebar`
                )
              }
            "
          />
        </div>
      </div>
    </section>
    <Sidebar
      v-model:visible="settingsSideBar"
      :baseZIndex="10000"
      position="right"
      class="w-full"
      blockScroll
      id="settings-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Settings Sidebar Close Button',
            'Settings Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <template #header><h1 class="font-medium">Settings</h1></template>
      <Settings />
    </Sidebar>
  </div>
</template>

<style lang="scss">
.the-header {
  background: var(--header-background);
  backdrop-filter: blur(5px);
  border: 1px solid var(--shade-400);

  .pi-bars {
    color: var(--text-color);
    font-size: var(--font-size-8);
  }
}
#settings-sidebar {
  background-color: var(--background2);
  .p-sidebar-header {
    padding: 0.75rem 0.75rem 0.75rem 1.25rem;
    justify-content: space-between;
  }
  .p-sidebar-content {
    padding: 0;
  }
  .p-sidebar-close {
    width: 32px !important;
    height: 32px !important;
  }
  .p-sidebar-close,
  .p-sidebar-close .p-icon {
    width: 18px;
    height: 18px;
    path {
      fill: var(--night);
    }
  }
}
</style>
