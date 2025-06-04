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
  <div class="the-header w-screen">
    <div class="content">
      <div class="top">
        <section class="full-width pr-3 md:pr-6">
          <div class="flex justify-content-between align-items-center relative">
            <SkipToContent />
            <VFlexibleLink
              to="/home"
              class="flex align-items-center"
              aria-label="WNYC Home"
              @click="handleLogoClick"
              @keydown.enter="handleLogoClick"
              raw
            >
              <WnycLogo class="wnyc-logo" />
            </VFlexibleLink>
            <div class="flex gap-2 sm:gap-4 align-items-center">
              <NavButton
                class="hidden xs:block"
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
                <template #menu>
                  <NavSubMenu v-if="!currentUser" class="login-signup">
                    <div class="flex flex-column p-4 gap-3">
                      <h1>Sign up for a free account, or log in</h1>
                      <p>See your listening history, favorites, and more.</p>
                      <Button
                        label="Create Free Account"
                        rounded
                        aria-label="Create Free Account"
                        @click="
                          () => {
                            navigateTo('/signup')
                            trackClickEvent(
                              'Click Tracking - Header Log In/Sign up dropdown Create Free Account Button',
                              'Header',
                              'Create Free Account'
                            )
                          }
                        "
                      />
                      <p class="text-center">or</p>
                      <Button
                        label="Log In"
                        severity="secondary"
                        rounded
                        aria-label="Log In"
                        @click="
                          () => {
                            navigateTo('/login')
                            trackClickEvent(
                              'Click Tracking - Header Log In/Sign up dropdown Log In Button',
                              'Header',
                              'Log In'
                            )
                          }
                        "
                      />
                    </div>
                  </NavSubMenu>
                </template>
              </NavButton>

              <DonateBtn class="-mr-2 -ml-2 sm:ml-0" />

              <Button
                :disabled="!isNetworkConnected"
                class="-mr-2"
                variant="text"
                severity="secondary"
                rounded
                aria-label="settings menu"
                @click="
                  () => {
                    settingsSideBarBrowser = true
                    trackClickEvent(
                      'Click Tracking - Header Hamburger Menu Button',
                      'Header',
                      'Open Sidebar'
                    )
                  }
                "
              >
                <template #icon>
                  <HamburgerCloseAnim :bool="settingsSideBarBrowser" />
                </template>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <TheHeaderMenu v-if="props.showMenu" />
    </div>
  </div>
</template>

<style lang="scss">
.the-header {
  background: var(--header-background);
  backdrop-filter: blur(4px);
  max-width: 100vw;
  margin: auto;
  .content {
    max-width: $contentWidth;
    margin: auto;
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
      }

      .get-the-app-btn {
        @include media("<425px") {
          display: none;
        }
      }
    }
  }
}
</style>
