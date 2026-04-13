<script setup>
import { trackClickEvent, getDate } from "~/utilities/helpers"

import {
  useSettingSideBar,
  useIsNetworkConnected,
} from "~/composables/states.ts"

const config = useRuntimeConfig()
const settingsSideBar = useSettingSideBar()
const isNetworkConnected = useIsNetworkConnected()

const donateButtonText = ref(null)
const donateButtonLink = ref(null)

// check if donate button should be visible and get the button link and text
const { data: messageData } = await useFetchWrapper(
  `${config.public.SYSTEM_MESSAGES_API}`,
  {
    key: "donate-button",
  }
)
if (messageData.value?.product_banners?.length > 0) {
  messageData.value.product_banners.forEach((banner) => {
    if (banner.value?.title === "WNYC App Donate Button") {
      donateButtonText.value = banner.value?.button_text
      donateButtonLink.value = banner.value?.button_link
    }
  })
}
</script>

<template>
  <div class="the-header-app">
    <section class="full-width">
      <div class="flex justify-content-between align-items-center">
        <div class="flex align-items-center">
          <WnycLogo class="w-5rem mr-3" />

          <span class="head-date font-meta">{{ getDate() }}</span>
        </div>
        <div class="flex">
          <VFlexibleLink
            v-if="donateButtonText && donateButtonLink"
            raw
            :to="donateButtonLink"
            @flexible-link-click="
              trackClickEvent(
                `Click Tracking - Header Donate Button`,
                'Header',
                'Donate Button'
              )
            "
          >
            <Button
              :label="donateButtonText"
              aria-label="donate"
              class="px-3 sm:px-5 mr-3"
            />
          </VFlexibleLink>

          <Button
            :disabled="!isNetworkConnected"
            icon="pi pi-bars"
            variant="text"
            severity="secondary"
            rounded
            aria-label="settings menu"
            @click="
              () => {
                settingsSideBar = true
                trackClickEvent(
                  'Click Tracking - Header Hamburger Menu',
                  'Header',
                  `Open Sidebar`
                )
              }
            "
          />
        </div>
      </div>
    </section>
  </div>
</template>

<style lang="scss">
.the-header-app {
  background: var(--header-background);
  backdrop-filter: blur(4px);
  border: 1px solid var(--stroke-toggle-color);
  height: var(--header-height);
  display: flex;
  .pi-bars {
    font-size: var(--font-size-8);
  }
  .head-date {
    font-family: var(--font-family-header);
    line-height: 1rem;
    font-size: 0.9rem;
    @include media("<xs") {
      display: none;
    }
  }
}
</style>
