<script setup>
import { trackClickEvent, getDate } from "~/utilities/helpers"
import useNavigationData from "~/composables/useNavigationData"

import {
  useSettingSideBar,
  useSettingsSideBarBrowser,
  useIsNetworkConnected,
  useIsApp,
} from "~/composables/states.ts"

const settingsSideBar = useSettingSideBar()
const settingsSideBarBrowser = useSettingsSideBarBrowser()
const isNetworkConnected = useIsNetworkConnected()
const isApp = useIsApp()

const { headerNavigationData } = await useNavigationData()

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
            <GetTheAppBtn v-if="!isApp" />
            <LoginSignupBtn v-if="!isApp" class="hidden md:block" />
            <DonateBtn class="-mr-2" />

            <Button
              :disabled="!isNetworkConnected"
              icon="pi pi-bars"
              class="p-button-text -mr-2"
              severity="secondary"
              aria-label="settings menu"
              @click="
                () => {
                  isApp ? (settingsSideBar = true) : (settingsSideBarBrowser = true)
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
                    @click.stop
                    class="w-full"
                    @flexible-link-click="
                      () => {
                        handleMouseLeave()
                        trackClickEvent(
                          `Click Tracking - Header ${item.label} Button`,
                          'Header',
                          `${item.label} Button`
                        )
                      }
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
                    >
                      <div class="flex align-items-center">
                        <VImage
                          v-if="item?.image && typeof item?.image === 'object'"
                          class="flex-none mr-3"
                          :alt="item.image.altText"
                          :src="item.image.template"
                          :height="60"
                          :width="60"
                          :ratio="[1, 1]"
                          :srcset="[2]"
                          style="height: 60px; width: 60px"
                        />
                        <img
                          v-else-if="item.image"
                          :alt="item.label"
                          :src="item.image"
                          class="flex-none mr-3"
                          style="width: 60px; height: 60px"
                        />
                        <div class="p-button-label">{{ item.label }}</div>
                      </div>
                    </Button>
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
    .get-the-app-btn {
      @include media("<425px") {
        display: none;
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
        z-index: 1;
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
