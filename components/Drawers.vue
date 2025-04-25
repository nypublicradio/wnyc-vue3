<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import {
  useSettingSideBar,
  useSettingsSideBarBrowser,
  useLoginSideBar,
  useSignupSideBar,
  useForgotPasswordSideBar,
  useEditProfileSideBar,
  useAccountPromptSideBar,
  useAccountDeleteSideBar,
  useSleepTimerSideBar,
} from "~/composables/states"

const settingsSideBar = useSettingSideBar()
const settingsSideBarBrowser = useSettingsSideBarBrowser()
const loginSideBar = useLoginSideBar()
const signinSideBar = useSignupSideBar()
const forgotPasswordSideBar = useForgotPasswordSideBar()
const editProfileSideBar = useEditProfileSideBar()
const accountPromptSideBar = useAccountPromptSideBar()
const accountDeleteSideBar = useAccountDeleteSideBar()
const sleepTimerSideBar = useSleepTimerSideBar()
const scrollPosition = ref(0)

// save the users current scroll position
const saveScrollPosition = () => {
  scrollPosition.value = window.scrollY
}
// restore the user to their saved scroll position
const restoreScrollPosition = () => {
  document.body.classList.remove("p-overflow-hidden")
  if (scrollPosition.value > 0) {
    window.scrollTo(0, parseInt(scrollPosition.value))
    scrollPosition.value = 0
  }
}
</script>

<template>
  <div class="sidebars">
    <Drawer
      v-model:visible="settingsSideBarBrowser"
      :baseZIndex="10000"
      position="right"
      blockScroll
      @show="saveScrollPosition"
      class="w-full style-mode-dark hamburger-drawer-browser"
      id="settings-sidebar-browser"
      @hide="
        () => {
          restoreScrollPosition()
          trackClickEvent(
            'Click Tracking - Settings Sidebar Browser Close Button',
            'Settings Sidebar Browser',
            `close sidebar`
          )
        }
      "
    >
      <template #closeicon>
        <HamburgerCloseAnim :bool="settingsSideBarBrowser" />
      </template>
      <template #header>
        <div
          class="flex w-full align-items-start lg:align-items-center justify-content-between style-mode-dark p-2 pr-2 lg:pr-3"
        >
          <div
            class="flex flex-wrap gap-3 flex-column align-items-start lg:flex-row lg:align-items-center p-2"
          >
            <WnycLogo class="flex-none w-6rem lg:w-7rem" />
            <span class="hidden lg:flex gap-3">
              <SettingsBrowserButtons />
            </span>
          </div>
          <div class="flex gap-3 align-items-center mt-2 lg:mt-0">
            <DonateBtn trackingLocation="header Hamburger Menu" />
          </div>
        </div>
      </template>
      <SettingsBrowser />
    </Drawer>
    <Drawer
      v-model:visible="settingsSideBar"
      :baseZIndex="10000"
      position="right"
      class="w-full"
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
      <template #header><span></span></template>
      <Settings />
    </Drawer>
    <Drawer
      v-model:visible="loginSideBar"
      :baseZIndex="10001"
      position="right"
      class="w-full hideX"
      blockScroll
      id="login-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Login Sidebar Close Button',
            'Login Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <!-- <template #header><h1 class="font-medium">Log in</h1></template> -->
      <Login />
    </Drawer>
    <Drawer
      v-model:visible="signinSideBar"
      :baseZIndex="10002"
      position="right"
      class="w-full hideX"
      blockScroll
      id="signin-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Sign in Sidebar Close Button',
            'Sign in Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <Signup />
    </Drawer>
    <Drawer
      v-model:visible="forgotPasswordSideBar"
      :baseZIndex="10003"
      position="right"
      class="w-full hideX"
      blockScroll
      id="forgot-password-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Forgot Password Sidebar Close Button',
            'Forgot Password Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <ForgotPassword />
    </Drawer>

    <Drawer
      v-model:visible="editProfileSideBar"
      :baseZIndex="10003"
      position="right"
      class="w-full hideX"
      blockScroll
      id="edit-profile-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Edit Profile Sidebar Close Button',
            'Edit Profile Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <EditProfile />
    </Drawer>
    <Drawer
      v-model:visible="accountPromptSideBar"
      :baseZIndex="10003"
      position="bottom"
      class="w-full hideX no-safe-area h-auto"
      id="account-prompt-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Account Prompt Sidebar Close Button',
            'Account Prompt Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <AccountPromptSideBar />
    </Drawer>
    <Drawer
      v-model:visible="accountDeleteSideBar"
      :baseZIndex="10003"
      position="right"
      class="w-full hideX"
      id="account-delete-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Account Delete Sidebar Close Button',
            'Account Delete Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <AccountDeleteSideBar />
    </Drawer>

    <Drawer
      v-model:visible="sleepTimerSideBar"
      :baseZIndex="10003"
      position="bottom"
      class="w-full hideX no-safe-area h-auto"
      :class="[{ hide: !sleepTimerSideBar }]"
      id="sleep-timer-sidebar"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Sleep Timer Sidebar Close Button',
            'Sleep Timer Sidebar',
            `close sidebar`
          )
        }
      "
    >
      <SleepTimer />
    </Drawer>
  </div>
</template>

<style lang="scss">
.p-drawer {
  padding-top: env(safe-area-inset-top);
  background: var(--p-surface-25);
  border: none;

  .p-drawer-header {
    padding: 0.4rem 0.75rem;

    @include media("<lg") {
      padding: 0.5rem;
    }

    justify-content: space-between;
  }

  .p-drawer-content {
    padding: 0;
  }

  .p-drawer-close {
    width: 32px !important;
    height: 32px !important;
  }

  .p-drawer-close,
  .p-drawer-close .p-icon {
    width: 18px;
    height: 18px;

    path {
      fill: var(--bw-toggle);
    }
  }

  &.hideX {
    .p-drawer-header {
      display: none !important;
    }
  }

  &.no-safe-area {
    padding-top: 0 !important;
  }

  &.style-mode-dark {
    background: var(--p-surface-950);

    .p-drawer-header,
    .p-drawer-content {
      background: var(--p-surface-950);
    }
  }

  &.hamburger-drawer-browser {
    // transition: transform 0.4s ease-in-out;

    @include media(">=lg") {
      transition-delay: 0s;
      transition: 0s;
    }

    .p-drawer-header {
      padding-right: 42px;
      padding-left: 33px;
      border-bottom: 1px solid var(--p-text-color);

      @include media("<lg") {
        padding-right: 10px;
        padding-left: 10px;
        align-items: flex-start;

        .p-drawer-close-button {
          margin-top: 14px;
        }
      }
    }
  }
}
</style>
