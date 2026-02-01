<script lang="ts" setup>
import {
  useSettingsSideBarBrowser,
  useCurrentUser,
  useCurrentUserProfile,
  useAppDownloadLink,
} from "~/composables/states"
import { memberCenterLink } from "~/composables/globals"

const settingsSideBarBrowser = useSettingsSideBarBrowser()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const appDownloadLink = useAppDownloadLink()
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
    :route="appDownloadLink"
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
    :route="currentUser ? '/dashboard' : '/login'"
    @emit-click="settingsSideBarBrowser = false"
  >
    <template #icon>
      <UserIcon />
    </template>
  </NavButton>
  <NavButton
    class="-ml-3 lg:ml-0"
    label="Member Center"
    size="small"
    trackingLocation="header Hamburger Menu"
    :route="memberCenterLink"
    @emit-click="settingsSideBarBrowser = false"
  >
    <template #icon>
      <i
        class="pi pi-users"
        style="
          font-size: 20px;
          height: 28px;
          width: 22px;
          display: flex;
          align-items: center;
          margin-left: 4px;
        "
      ></i>
    </template>
  </NavButton>
</template>
