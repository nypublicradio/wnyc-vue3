<script setup>
import { getYear } from "~/utilities/helpers"
import { useCurrentUser, useSettingsSideBarBrowser } from "~/composables/states.ts"
const currentUser = useCurrentUser()
const settingsSideBarBrowser = useSettingsSideBarBrowser()
const { allNavigationData } = await useNavigationData()
const config = useRuntimeConfig()
</script>

<template>
  <div
    class="settings-desktop style-mode-dark"
    :class="[{ 'logged-in': currentUser, 'logged-out': !currentUser }]"
  >
    <div class="flex flex-column gap-3 py-4 px-4 lg:hidden">
      <SettingsBrowserButtons />
    </div>
    <div class="menu py-4 px-4 md:px-6 lg:py-6 flex">
      <ExpandedMenuItem
        v-for="item in allNavigationData"
        :key="item.id"
        :item="item"
        :class="`menu-holder ${item.class}`"
        :menuData="item"
        @emit-click="settingsSideBarBrowser = false"
      />
    </div>
    <section class="footer mb-4">
      <WnycLogo style="fill: var(--bw-toggle)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section>
  </div>
</template>

<style lang="scss">
.settings-desktop {
  background-color: var(--p-surface-950);
  height: 100%;

  section {
    margin-bottom: 30px;
  }

  .menu {
    gap: 4rem;
    flex-wrap: wrap;

    .menu-holder {
      min-width: 290px;

      .menu-btn {
        .p-button-label {
          text-align: left;
        }
      }
    }

    .saved {
      display: none;
    }
  }

  &.logged-out {
    .menu-holder {
      &.saved {
        display: none;
      }

      &.account {
        .logout,
        .manage {
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

  .footer {
    text-align: center;

    .wnyc-logo {
      width: 60px;
      height: auto;
      margin-bottom: 10px;
      fill: var(--p-surface-950);
    }
  }
}
</style>
