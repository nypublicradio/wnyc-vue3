<script setup>
import useNavigationData from "~/composables/useNavigationData"
import { onMounted } from "vue"
import {
  trackClickEvent,
  getYear,
  setFontSize,
  setDarkMode,
  toggleAskNotificationPermissions,
  //toSystemSettings,
} from "~/utilities/helpers"
import {
  useAllCurrentStations,
  useTextSizeOption,
  useCurrentUser,
  useCurrentUserProfile,
  useEditProfileSideBar,
  useIsLiveStream,
  useIsApp,
  useAccountDeleteSideBar,
  useGlobalToast,
  useSettingsSideBarBrowser,
} from "~/composables/states.ts"
import { Preferences } from "@capacitor/preferences"
import { localUserProfileKey } from "~/composables/globals"
import { updateLiveStream } from "~/composables/data/liveStream"
const globalToast = useGlobalToast()
const config = useRuntimeConfig()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const textSizeOptions = useTextSizeOption()
const editProfileSideBar = useEditProfileSideBar()
const isLiveStream = useIsLiveStream()
const isApp = useIsApp()
const accountDeleteSideBar = useAccountDeleteSideBar()

const allCurrentStations = useAllCurrentStations()
const stationsMenuData = ref([])
const client = useSupabaseClient()

const settingsSideBarBrowser = useSettingsSideBarBrowser()
const { allNavigationData } = await useNavigationData()
</script>

<template>
  <div
    class="settings-desktop style-mode-dark"
    :class="[{ 'logged-in': currentUser, 'logged-out': !currentUser }]"
  >
    <div class="menu py-4 px-4 lg:py-6 flex">
      <!-- <p class="text-xs"><pre>{{ allNavigationData }}</pre></p> -->
      <div
        v-for="item in allNavigationData"
        :key="item.id"
        class="menu-holder"
        :class="item.class"
      >
        <h1 class="menu-h1">{{ item.label }}</h1>
        <div class="flex flex-column gap-2 -ml-2">
          <VFlexibleLink
            v-for="item in item.items[0]"
            :key="item.id"
            raw
            :to="item.url"
            class="menu-btn"
            :class="item.class"
            @flexible-link-click="
              () => {
                settingsSideBarBrowser = false
                item.command()
                trackClickEvent(
                  `Click Tracking - ${item.label} Button`,
                  'hamburger menu',
                  `${item.label} Button`
                )
              }
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
        </div>
      </div>
    </div>
    <!-- <section class="footer mb-4">
      <WnycLogo style="fill: var(--bw-toggle)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section> -->
  </div>
</template>

<style lang="scss" scoped>
.settings-desktop {
  background-color: var(--p-surface-950);
  height: 100%;
  section {
    margin-bottom: 30px;
  }
  .menu {
    gap: 4rem;
    flex-wrap: wrap;
    .menu-h1 {
      margin-bottom: 16px;
      @include media("<lg") {
        font-size: 0.813rem;
        text-transform: uppercase;
        font-weight: var(--font-weight-400);
        margin-bottom: 8px;
      }
    }
    .menu-holder {
      min-width: 300px;
      .menu-btn {
      }
    }
  }
  // .footer {
  //   text-align: center;
  //   .wnyc-logo {
  //     width: 60px;
  //     height: auto;
  //     margin-bottom: 10px;
  //     fill: var(--p-surface-950);
  //   }
  // }
  &.logged-out {
    .menu-holder {
      &.saved {
        display: none;
      }
      &.account {
        .logout {
          display: none;
        }
      }
    }
  }
  &.logged-in {
    .menu-holder {
      &.account {
        .login,
        .signup {
          display: none;
        }
      }
    }
  }
}
</style>

<style lang="scss">
.settings-desktop {
  .menu-holder {
    .menu-btn {
      .p-button-label {
        text-align: left;
      }
    }
  }
}
</style>
