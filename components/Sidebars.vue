<script setup>
import { trackClickEvent } from '~/utilities/helpers'
import {
  useSettingSideBar,
  useLoginSideBar,
  useSignupSideBar,
} from '~/composables/states'

const settingsSideBar = useSettingSideBar()
const loginSideBar = useLoginSideBar()
const signinSideBar = useSignupSideBar()
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
      :baseZIndex="10001"
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
  </div>
</template>

<style lang="scss">
.hideX {
  .p-sidebar-header {
    display: none !important;
  }
}
</style>
