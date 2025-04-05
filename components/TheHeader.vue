<script setup>
import { trackClickEvent, getDate } from "~/utilities/helpers"
import useNavigationData from "~/composables/useNavigationData"

import {
  useSettingSideBar,
  useSettingsSideBarBrowser,
  useIsNetworkConnected,
  useIsApp,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states.ts"

const settingsSideBar = useSettingSideBar()
const settingsSideBarBrowser = useSettingsSideBarBrowser()
const isNetworkConnected = useIsNetworkConnected()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const isApp = useIsApp()

const { headerNavigationData } = await useNavigationData()

// BFF ATTEMPT
// const config = useRuntimeConfig()
// const { data: vData, error } = await useFetch(`${config.public.BFF_URL}/api/navigation`)
// const headerNavigationData = vData.value.data.headerNavigationData
// console.log("error", error.value)
// console.log("headerNavigationData", headerNavigationData)
// BFF ATTEMPT

// handle when the logo is clicked
const handleLogoClick = () => {
  navigateTo("/home")
  trackClickEvent("Click Tracking - Header WNYC Logo", "Header", "WNYC Logo")
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
            <NavButton
              v-if="!isApp"
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
              v-if="!isApp"
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
    <!-- <pre>{{ headerNavigationData[0].items[0] }}</pre> -->
    <div v-if="!isApp && headerNavigationData" class="bottom hidden lg:block">
      <section class="full-width py-0 -mt-2">
        <Divider class="my-0" />
      </section>
      <section
        class="content full-width"
        :class="[{ 'logged-in': currentUser, 'logged-out': !currentUser }]"
      >
        <NavButton
          v-for="item in headerNavigationData"
          :key="item.id"
          :index="item.id"
          class="bold inline relative"
          :class="item.class"
          size="normal"
          :label="item.label"
          trackingLocation="header main nav"
          :route="item.url"
          @emit-click="settingsSideBarBrowser = false"
        >
          <template #menu v-if="item.items">
            <NavSubMenu :model="item?.items[0]" />
          </template>
        </NavButton>
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
      display: flex;
      gap: 0rem 1rem;
      flex-wrap: wrap;

      &.logged-out {
        .saved {
          display: none;
        }
      }

      &.logged-in {
      }
    }
  }
}
</style>
