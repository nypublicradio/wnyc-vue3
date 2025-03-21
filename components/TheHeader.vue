<script setup>
import { trackClickEvent, getDate } from "~/utilities/helpers"
import useNavigationData from "~/composables/useNavigationData"

import {
  useSettingSideBar,
  useIsNetworkConnected,
  useIsApp,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states.ts"

const settingsSideBar = useSettingSideBar()
const isNetworkConnected = useIsNetworkConnected()
const isApp = useIsApp()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()

const { donateButtonData, headerNavigationData } = await useNavigationData()

const handleLogoClick = () => {
  navigateTo("/home")
  trackClickEvent("Click Tracking - Header WNYC Logo", "Header", "WNYC Logo")
}

const activeItemIndex = ref(null)

const handleMouseEnter = (item, event) => {
  event.stopPropagation()
  if (item.items) activeItemIndex.value = item.id
}

const handleMouseLeave = () => {
  activeItemIndex.value = null
}
</script>

<template>
  <div class="the-header">
    <div class="top">
      <section class="full-width">
        <div class="flex justify-content-between align-items-center">
          <div class="flex align-items-center">
            <WnycLogo class="wnyc-logo cursor-pointer" @click="handleLogoClick" />

            <span v-if="isApp" class="head-date font-meta ml-3">{{ getDate() }}</span>
          </div>
          <div class="flex gap-3 sm:gap-4 align-items-center">
            <VFlexibleLink
              v-if="!isApp"
              class="get-app-button"
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
              v-if="!isApp"
              class="hidden md:block"
              :class="{ 'user-logged-in': currentUser }"
              raw
              to="/login"
              @flexible-link-click="
                trackClickEvent(
                  `Click Tracking - Header Log in/Sign up Button`,
                  'Header',
                  'Log in/Sign up Button'
                )
              "
            >
              <Button
                :label="`${
                  currentUser ? 'Hi, ' + currentUserProfile.name : 'Log in/Sign up'
                }`"
                aria-label="Log in/Sign up button"
                severity="secondary"
                size="small"
                variant="link"
                :disabled="currentUser"
              >
                <template #icon>
                  <UserIcon />
                </template>
              </Button>
            </VFlexibleLink>
            <VFlexibleLink
              v-if="donateButtonData.buttonText"
              raw
              :to="donateButtonData.buttonLink"
              @flexible-link-click="
                trackClickEvent(
                  `Click Tracking - Header Donate Button`,
                  'Header',
                  'Donate Button'
                )
              "
            >
              <Button
                :label="donateButtonData.buttonText"
                aria-label="donate"
                class="px-3 sm:px-5 -mr-2"
              />
            </VFlexibleLink>

            <Button
              :disabled="!isNetworkConnected"
              icon="pi pi-bars"
              class="p-button-text -mr-2"
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
    <div v-if="!isApp && headerNavigationData" class="bottom hidden lg:block">
      <section class="full-width py-0 -mt-2">
        <Divider class="my-0" />
      </section>
      <section class="content full-width py-1">
        <MegaMenu :model="headerNavigationData">
          <template #item="{ item }">
            <div
              @mouseenter="handleMouseEnter(item, $event)"
              @mouseleave="handleMouseLeave"
            >
              <VFlexibleLink
                raw
                :to="item.url"
                @flexible-link-click="
                  trackClickEvent(
                    `Click Tracking - Header ${item.label} Button`,
                    'Header',
                    `${item.label} Button`
                  )
                "
              >
                <Button
                  raw
                  :label="item.label"
                  :aria-label="`${item.label} button`"
                  severity="secondary"
                  size="small"
                  variant="link"
                />
              </VFlexibleLink>

              <Menu
                :model="item.items[0]"
                v-if="activeItemIndex === item.id && item.items[0]"
              >
                <template #item="{ item }">
                  <VFlexibleLink
                    raw
                    :to="item.url"
                    class="w-full"
                    @flexible-link-click="
                      trackClickEvent(
                        `Click Tracking - Header ${item.label} Button`,
                        'Header',
                        `${item.label} Button`
                      )
                    "
                  >
                    <Button
                      raw
                      class="submenu-btn"
                      :label="item.label"
                      :aria-label="`${item.label} button`"
                      severity="secondary"
                      size="small"
                      variant="link"
                    />
                  </VFlexibleLink>
                </template>
              </Menu>
            </div>
          </template>
        </MegaMenu>
      </section>
    </div>
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
    .head-date {
      font-family: var(--font-family-header);
      line-height: 1rem;
      font-size: 0.9rem;
      @include media("<xs") {
        display: none;
      }
    }
    .wnyc-logo {
      width: 120px;
      @include media("<lg") {
        width: 100px;
      }
      @include media("<md") {
        width: 75px;
      }
    }
    .get-app-button {
      @include media("<425px") {
        display: none;
      }
    }
    .user-logged-in {
      .p-button {
        opacity: 1;
      }
    }
  }
  .bottom {
    //height: var(--header-bottom-height);
    .content {
      margin-left: -12px;
      .p-button-label {
        font-weight: 700;
      }
      .p-menu {
        position: absolute;
        border: none;
        -webkit-border-radius: 0 0 20px 20px;
        padding-bottom: 1rem;
        border-radius: 0 0 20px 20px;
        -webkit-box-shadow: 0 7px 5px 0 rgba(0, 0, 0, 0.2);
        box-shadow: 0 7px 5px 0 rgba(0, 0, 0, 0.2);
        background-color: var(--header-menu-background);
        ul {
          padding: 0;
          li {
            .p-menu-item-content {
              &:hover {
                background-color: var(--header-submenu-background);
              }
            }
          }
        }
      }
      .submenu-btn {
        width: 100%;
        justify-content: flex-start;
        border-radius: 0;
        padding: 0.5rem 1rem;
        .p-button-label {
          font-weight: 400;
          text-align: left;
        }
      }
    }
    .p-megamenu-overlay {
      display: none !important;
    }
  }
}
</style>
