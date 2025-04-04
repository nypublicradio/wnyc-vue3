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
  useCurrentUser,
  useCurrentUserProfile,
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
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
  <div class="sidebars">
    <Drawer
      v-model:visible="settingsSideBarBrowser"
      :baseZIndex="10000"
      position="right"
      class="w-full style-mode-dark hamburger-drawer"
      id="settings-sidebar-browser"
      @hide="
        () => {
          trackClickEvent(
            'Click Tracking - Settings Sidebar Browser Close Button',
            'Settings Sidebar Browser',
            `close sidebar`
          )
        }
      "
    >
      <template #header>
        <div
          class="flex w-full align-items-start lg:align-items-center justify-content-between style-mode-dark p-2"
        >
          <div
            class="flex gap-3 flex-column align-items-start lg:flex-row lg:align-items-center p-2"
          >
            <WnycLogo class="flex-none w-6rem lg:w-8rem" />
            <NavButton
              class="-ml-3 lg:ml-0"
              size="small"
              label="Listen Live"
              trackingLocation="header Hamburger Menu"
              route="/live"
              @emit-click="settingsSideBarBrowser = false"
            >
              <template #icon>
                <LiveLinesIcon />
              </template>
            </NavButton>
            <NavButton
              class="-ml-3 lg:ml-0"
              size="small"
              label="Get the App"
              trackingLocation="header Hamburger Menu"
              route="/mobile"
              @emit-click="settingsSideBarBrowser = false"
            >
              <template #icon>
                <DevicesIcon />
              </template>
            </NavButton>
            <NavButton
              class="-ml-3 lg:ml-0"
              :label="`${currentUser ? currentUserProfile?.name : 'Log in/Sign up'}`"
              size="small"
              trackingLocation="header Hamburger Menu"
              route="/login"
              :to="currentUser ? '/dashboard' : 'login'"
              @emit-click="settingsSideBarBrowser = false"
            >
              <template #icon>
                <UserIcon />
              </template>
            </NavButton>
          </div>
          <div class="flex gap-3 align-items-center mt-2 lg:mt-0">
            <DarkModeIconToggleBtn class="hidden sm:block" />
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
    padding: 0.75rem;
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
  &.hamburger-drawer {
    .p-drawer-header {
      border-bottom: 1px solid var(--p-text-color);
      @include media("<lg") {
        align-items: flex-start;
        .p-drawer-close-button {
          margin-top: 14px;
        }
      }
    }
  }
}
</style>
