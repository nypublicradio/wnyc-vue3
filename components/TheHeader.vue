<script setup>
import { trackClickEvent } from "~/utilities/helpers"

import {
  useSettingsSideBarBrowser,
  useIsNetworkConnected,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states.ts"

const props = defineProps({
  showMenu: {
    type: Boolean,
    default: false,
  },
})

const settingsSideBarBrowser = useSettingsSideBarBrowser()
const isNetworkConnected = useIsNetworkConnected()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()

// handle when the logo is clicked
const handleLogoClick = () => {
  trackClickEvent("Click Tracking - Header WNYC Logo", "Header", "WNYC Logo")
}
</script>

<template>
  <div class="the-header">
    <div class="top">
      <section class="full-width pr-3 md:pr-6">
        <div class="flex justify-content-between align-items-center">
          <NuxtLink
            to="/home"
            class="flex align-items-center"
            aria-label="WNYC Home"
            @click="handleLogoClick"
            @keydown.enter="handleLogoClick"
          >
            <WnycLogo class="wnyc-logo" />
          </NuxtLink>
          <div class="flex gap-2 sm:gap-4 align-items-center">
            <NavButton
              size="small"
              label="Get the App"
              trackingLocation="header utility nav"
              route="/mobile"
            >
              <template #icon>
                <DevicesIcon />
              </template>
            </NavButton>
            <NavButton
              class="hidden md:block"
              :label="`${currentUser ? currentUserProfile?.name : 'Log in/Sign up'}`"
              size="small"
              trackingLocation="header utility nav"
              route="/login"
              :to="currentUser ? '/dashboard' : 'login'"
            >
              <template #icon>
                <UserIcon />
              </template>
            </NavButton>
            <DonateBtn class="-mr-2 -ml-2 sm:ml-0" />

            <Button
              :disabled="!isNetworkConnected"
              icon="pi pi-bars"
              class="p-button-text -mr-2"
              severity="secondary"
              aria-label="settings menu"
              @click="
                () => {
                  settingsSideBarBrowser = true
                  trackClickEvent(
                    'Click Tracking - Header Hamburger Menu Button',
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
    <TheHeaderMenu v-if="props.showMenu" />
  </div>
</template>

<style lang="scss">
.the-header {
  background: var(--header-background);
  backdrop-filter: blur(4px);
  border: 1px solid var(--stroke-toggle-color);

  .top {
    height: var(--header-height);
    display: flex;

    .pi-bars {
      font-size: var(--font-size-8);
    }

    .wnyc-logo {
      width: 7rem;

      @include media("<lg") {
        width: 100px;
      }

      @include media("<md") {
        width: 75px;
      }

      @include media("<400px") {
        width: 50px;
      }
    }

    .get-the-app-btn {
      @include media("<425px") {
        display: none;
      }
    }
  }
}
</style>
