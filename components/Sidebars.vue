<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import {
  useSettingSideBar,
  useLoginSideBar,
  useSignupSideBar,
  useForgotPasswordSideBar,
  useEditProfileSideBar,
  useAccountPromptSideBar,
  useAccountDeleteSideBar,
  useSleepTimerSideBar,
} from "~/composables/states"

const settingsSideBar = useSettingSideBar()
const loginSideBar = useLoginSideBar()
const signinSideBar = useSignupSideBar()
const forgotPasswordSideBar = useForgotPasswordSideBar()
const editProfileSideBar = useEditProfileSideBar()
const accountPromptSideBar = useAccountPromptSideBar()
const accountDeleteSideBar = useAccountDeleteSideBar()
const sleepTimerSideBar = useSleepTimerSideBar()
</script>

<template>
  <div class="sidebars">
    <Sidebar
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
    </Sidebar>
    <Sidebar
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
    </Sidebar>
    <Sidebar
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
    </Sidebar>
    <Sidebar
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
    </Sidebar>

    <Sidebar
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
    </Sidebar>
    <Sidebar
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
    </Sidebar>
    <Sidebar
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
    </Sidebar>

    <Sidebar
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
    </Sidebar>
  </div>
</template>

<style lang="scss">
.p-sidebar {
  padding-top: env(safe-area-inset-top);
  background: var(--background2);
  .p-sidebar-header {
    padding: 0.75rem 0.75rem 0.75rem 1.25rem;
    justify-content: space-between;
  }
  .p-sidebar-content {
    padding: 0;
  }
  .p-sidebar-close {
    width: 32px !important;
    height: 32px !important;
  }
  .p-sidebar-close,
  .p-sidebar-close .p-icon {
    width: 18px;
    height: 18px;
    path {
      fill: var(--night);
    }
  }
  &.hideX {
    .p-sidebar-header {
      display: none !important;
    }
  }
  &.no-safe-area {
    padding-top: 0 !important;
  }
}
</style>
