<script lang="ts" setup>
import {
  useSettingsSideBarBrowser,
  useCurrentUser,
  useCurrentUserProfile,
} from "~/composables/states"

const settingsSideBarBrowser = useSettingsSideBarBrowser()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
</script>

<template>
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
</template>
