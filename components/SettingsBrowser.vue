<script setup>
import { trackClickEvent } from "~/utilities/helpers"
import { useCurrentUser, useSettingsSideBarBrowser } from "~/composables/states.ts"
const currentUser = useCurrentUser()
const settingsSideBarBrowser = useSettingsSideBarBrowser()
const { allNavigationData } = await useNavigationData()
</script>

<template>
  <div
    class="settings-desktop style-mode-dark"
    :class="[{ 'logged-in': currentUser, 'logged-out': !currentUser }]"
  >
    <div class="menu py-4 px-4 lg:py-6 flex">
      <ExpandedMenuItem
        v-for="item in allNavigationData"
        :key="item.id"
        :item="item"
        :class="`menu-holder ${item.class}`"
        :menuData="item"
        @emit-click="settingsSideBarBrowser = false"
      />
      <!-- <div
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
      </div> -->
    </div>
    <!-- <section class="footer mb-4">
      <WnycLogo style="fill: var(--bw-toggle)" />
      <p>© {{ getYear() }} New York Public Radio. All rights reserved.</p>
      <p>Version {{ config.public.APP_VERSION }}</p>
    </section> -->
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
}
</style>
