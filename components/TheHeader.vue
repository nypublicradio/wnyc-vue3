<script setup>
import VFlexibleLink from '@nypublicradio/nypr-design-system-vue3/v2/src/components/VFlexibleLink.vue'

import { trackClickEvent, getDate } from '~/utilities/helpers'

const visibleRight = ref(false)
</script>

<template>
  <div class="the-header">
    <section class="full-width">
      <div class="flex justify-content-between align-items-center">
        <div class="flex align-items-center">
          <VFlexibleLink
            raw
            to="/"
            class="mr-3"
            @emit-flexible-link="
              trackClickEvent('Click Tracking - WNYC Logo', 'WNYC Logo', '/')
            "
          >
            <WnycLogo class="w-5rem sm:w-auto" />
          </VFlexibleLink>
          <span class="font-meta">{{ getDate() }}</span>
        </div>
        <div class="flex">
          <!-- <VFlexibleLink
            raw
            to="https://pledge3.wnyc.org/donate/main/onestep/?utm_medium=partnersite&utm_source=w3k&utm_campaign=brandheader"
            @emit-flexible-link="
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
                visibleRight = true
                trackClickEvent(
                  'Click Tracking - Hamburger Menu',
                  'Hamburger Menu',
                  ``
                )
              }
            "
          />
        </div>
      </div>
    </section>
    <Sidebar
      v-model:visible="visibleRight"
      :baseZIndex="10000"
      position="right"
      class="text-center w-full"
    >
      <Settings />
    </Sidebar>
  </div>
</template>

<style lang="scss">
.the-header {
  background-color: transparentize(#ffffff, 0.1);
  backdrop-filter: blur(5px);
  border: 1px solid var(--shade-400);

  .pi-bars {
    color: var(--text-color);
    font-size: var(--font-size-8);
  }
  .p-sidebar {
    background: var(--background);
    opacity: 1;
  }
}
</style>
