<script setup>
import { trackClickEvent, getDate } from "~/utilities/helpers"

import {
  useSettingSideBar,
  useIsNetworkConnected,
  useIsApp,
  useCurrentUser,
} from "~/composables/states.ts"

const config = useRuntimeConfig()
const settingsSideBar = useSettingSideBar()
const isNetworkConnected = useIsNetworkConnected()
const isApp = useIsApp()
const currentUser = useCurrentUser()

const donateButtonText = ref(null)
const donateButtonLink = ref(null)

// check if donate button should be visible and get the button link and text
const { data: messageData } = await useFetch(`${config.public.SYSTEM_MESSAGES_API}`)
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
  <div class="the-header">
    <section class="full-width">
      <div class="flex justify-content-between align-items-center">
        <div class="flex align-items-center">
          <WnycLogo class="w-5rem mr-3" />

          <span v-if="isApp" class="head-date font-meta">{{ getDate() }}</span>
        </div>
        <div class="flex gap-4 align-items-center">
          <VFlexibleLink
            v-if="!isApp"
            raw
            to="/mobile"
            @flexible-link-click="
              trackClickEvent(
                `Click Tracking - Header Get the App Button`,
                'Header',
                'Get the App Button'
              )
            "
          >
            <Button
              label="Get the App"
              aria-label="Get the App button"
              size="small"
              variant="link"
            >
              <template #icon>
                <DevicesIcon />
              </template>
            </Button>
          </VFlexibleLink>
          <VFlexibleLink
            v-if="!currentUser"
            raw
            to="/mobile"
            @flexible-link-click="
              trackClickEvent(
                `Click Tracking - Header Log in/Sign up Button`,
                'Header',
                'Log in/Sign up Button'
              )
            "
          >
            <Button
              label="Log in/Sign up"
              aria-label="Log in/Sign up button"
              severity="secondary"
              size="small"
              variant="link"
            >
              <template #icon>
                <UserIcon />
              </template>
            </Button>
          </VFlexibleLink>
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
              class="px-3 sm:px-5 -mr-2"
            />
          </VFlexibleLink>

          <Button
            :disabled="!isNetworkConnected"
            icon="pi pi-bars"
            class="p-button-text"
            severity="secondary"
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
.the-header {
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
