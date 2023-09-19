<script setup>
import { trackClickEvent } from '~/utilities/helpers'
import {
  useSettingSideBar,
  useLoginSideBar,
  useSignupSideBar,
  useForgotPasswordSideBar,
  useEditProfileSideBar,
} from '~/composables/states'

const settingsSideBar = useSettingSideBar()
const loginSideBar = useLoginSideBar()
const signinSideBar = useSignupSideBar()
const forgotPasswordSideBar = useForgotPasswordSideBar()
const editProfileSideBar = useEditProfileSideBar()
</script>

<template>
  <div class="sidebars">
    <Sidebar
      v-model:visible="settingsSideBar"
      :baseZIndex="10000"
      position="right"
      class="w-full"
      blockScroll
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
      <template #header><h1 class="font-medium">Settings</h1></template>
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
  </div>
</template>

<style lang="scss">
.hideX {
  .p-sidebar-header {
    display: none !important;
  }
}
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
}
</style>
