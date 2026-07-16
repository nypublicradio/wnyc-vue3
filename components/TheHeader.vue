<script setup>
import { trackClickEvent, logOutUser } from "~/utilities/helpers"

import {
  useSettingsSideBarBrowser,
  useIsNetworkConnected,
  useCurrentUser,
  useCurrentUserProfile,
  useAppDownloadLink,
} from "~/composables/states.ts"
import { useToast } from "primevue/usetoast"
import { memberCenterLink } from "~/composables/globals.ts"

const props = defineProps({
  showMenu: {
    type: Boolean,
    default: false,
  },
  animMenu: {
    type: Boolean,
    default: false,
  },
  /**
   * number of pixels at the top of the page before the header minimizes
   */
  heroBuffer: {
    default: 400,
    type: Number,
  },
})

const settingsSideBarBrowser = useSettingsSideBarBrowser()
const isNetworkConnected = useIsNetworkConnected()
const currentUser = useCurrentUser()
const currentUserProfile = useCurrentUserProfile()
const appDownloadLink = useAppDownloadLink()
const toast = useToast()
// scroll handlers
const isMinimized = ref(false)
// handle when the logo is clicked
const handleLogoClick = () => {
  trackClickEvent("Click Tracking - Header WNYC Logo", "Header", "WNYC Logo")
}
const client = useSupabaseClient()
const user = await client.auth.getSession()
const avatarUrl = computed(() => {
  return (
    user.value?.data?.user?.user_metadata?.avatar_url ||
    currentUser.value?.user_metadata?.avatar_url ||
    currentUserProfile.value?.avatar_image_url ||
    null
  )
})

// handle view profile button is clicked
const goToProfile = () => {
  trackClickEvent(
    "Click Tracking - Header View My Profile button",
    "Header user hover panel",
    "View My Profile"
  )
  navigateTo("/dashboard")
}

// handle view member center button is clicked
const goToMemberCenter = () => {
  trackClickEvent(
    "Click Tracking - Header Member Center button",
    "Header user hover panel",
    "Member Center"
  )
  window.open(memberCenterLink, "_blank")
}

// handle log out button is clicked
const onLogOut = async () => {
  await logOutUser()

  navigateTo("/home")

  //GTM
  trackClickEvent(
    "Click Tracking - logout button",
    "Header user hover panel",
    "logout button"
  )

  // show toast
  toast.add({
    severity: "success",
    summary: "You have logged out.",
    life: 3000,
  })
}

if (props.animMenu) {
  // handle scroll events to minimize the header menu
  const calcScroll = (y, isScrolling, previousY) => {
    if (!props.showMenu) {
      return
    }
    if (y <= props.heroBuffer) {
      isMinimized.value = false
      return
    }
    if (y > previousY) {
      isMinimized.value = true
    } else if (previousY - y > 5) {
      isMinimized.value = false
    }
  }

  onMounted(() => {
    const scroll = useScroll(window, {
      behavior: "smooth",
    })

    watch([scroll.y, scroll.isScrolling], ([y, isScrolling], [previousY]) => {
      calcScroll(y, isScrolling, previousY)
    })
    calcScroll(1, true, 1)
  })
}
</script>

<template>
  <div class="the-header w-screen">
    <div class="content">
      <div class="top">
        <section class="full-width pr-3 md:pr-6">
          <div class="flex justify-content-between align-items-center relative">
            <SkipToContent />
            <VFlexibleLink
              to="/home"
              class="flex align-items-center"
              aria-label="WNYC Home"
              @click="handleLogoClick"
              @keydown.enter="handleLogoClick"
              raw
            >
              <WnycLogo class="wnyc-logo" />
            </VFlexibleLink>
            <div class="flex gap-2 sm:gap-4 align-items-center">
              <NavButton
                class="hidden xs:block"
                size="small"
                label="Get the App"
                trackingLocation="header utility nav"
                :route="appDownloadLink"
              >
                <template #icon>
                  <DevicesIcon />
                </template>
              </NavButton>
              <NavButton
                class="hidden md:block"
                :label="`${
                  currentUser
                    ? currentUserProfile?.name || 'User'
                    : 'Log in/Sign up'
                }`"
                size="small"
                trackingLocation="header utility nav"
                route="/login"
                :to="currentUser ? '/dashboard' : '/login'"
              >
                <template #icon>
                  <UserIcon />
                </template>
                <template #menu>
                  <NavSubMenu class="login-signup">
                    <div v-if="!currentUser" class="flex flex-column p-4 gap-2">
                      <h2>Sign up for a free account, or log in</h2>
                      <p>See your listening history, favorites, and more.</p>
                      <Button
                        label="Create Free Account"
                        rounded
                        aria-label="Create Free Account"
                        @click="
                          () => {
                            navigateTo('/signup')
                            trackClickEvent(
                              'Click Tracking - Header Log In/Sign up dropdown Create Free Account Button',
                              'Header',
                              'Create Free Account'
                            )
                          }
                        "
                      />
                      <p class="text-center">or</p>
                      <Button
                        label="Log In"
                        severity="secondary"
                        rounded
                        aria-label="Log In"
                        @click="
                          () => {
                            navigateTo('/login')
                            trackClickEvent(
                              'Click Tracking - Header Log In/Sign up dropdown Log In Button',
                              'Header',
                              'Log In'
                            )
                          }
                        "
                      />
                      <p class="mt-4">Manage donations</p>
                      <Button
                        label="Member Center"
                        severity="secondary"
                        rounded
                        aria-label="Member Center"
                        @click="goToMemberCenter"
                      />
                    </div>
                    <div v-else class="flex flex-column p-4 gap-3">
                      <div class="flex align-items-center gap-2">
                        <Avatar
                          :image="avatarUrl"
                          shape="circle"
                          class="flex-none"
                        >
                          <template #icon v-if="!avatarUrl">
                            <UserIcon />
                          </template>
                        </Avatar>
                        <h2>Hi, {{ currentUserProfile?.name || "User" }}</h2>
                      </div>
                      <Button
                        label="View My Account"
                        severity="secondary"
                        rounded
                        aria-label="View My Account"
                        @click="goToProfile"
                      />
                      <Button
                        label="Member Center"
                        severity="secondary"
                        rounded
                        aria-label="Member Center"
                        @click="goToMemberCenter"
                      />
                      <Button
                        label="Log Out"
                        severity="secondary"
                        rounded
                        aria-label="Log Out"
                        @click="onLogOut"
                      />
                    </div>
                  </NavSubMenu>
                </template>
              </NavButton>

              <DonateBtn class="-mr-2 -ml-2 sm:ml-0" />

              <Button
                :disabled="!isNetworkConnected"
                class="-mr-2"
                variant="text"
                severity="secondary"
                rounded
                aria-label="settings menu"
                @click="
                  () => {
                    settingsSideBarBrowser = true
                    trackClickEvent(
                      'Click Tracking - Header Hamburger Menu Button',
                      'Header',
                      'Open Sidebar'
                    )
                  }
                "
              >
                <template #icon>
                  <HamburgerCloseAnim :bool="settingsSideBarBrowser" />
                </template>
              </Button>
            </div>
          </div>
        </section>
      </div>
      <TheHeaderMenu v-if="!props.animMenu && props.showMenu" />
      <Transition v-else name="header-menu-minimize">
        <TheHeaderMenu v-if="!isMinimized" />
      </Transition>
    </div>
  </div>
</template>

<style lang="scss">
.the-header {
  background: var(--header-background);
  backdrop-filter: blur(4px);
  max-width: 100%;
  margin: auto;
  .content {
    max-width: $contentWidth;
    margin: auto;
    transition: height calc(var(--p-transition-duration) * 2) ease-out;
    -webkit-transition: height calc(var(--p-transition-duration) * 2) ease-out;
    .top {
      height: var(--header-height);
      display: flex;

      .pi-bars {
        font-size: var(--font-size-8);
      }

      .wnyc-logo {
        width: 7rem;

        @include media("<lg") {
          width: 100px;
        }

        @include media("<md") {
          width: 75px;
        }
      }

      .get-the-app-btn {
        @include media("<425px") {
          display: none;
        }
      }
    }
  }
}
//transition for the header menu when it minimizes
.header-menu-minimize-enter-active {
  transition: margin-top calc(var(--p-transition-duration) * 2) ease,
    opacity calc(var(--p-transition-duration) * 0.75) linear 0.25s;
}
.header-menu-minimize-leave-active {
  transition: margin-top calc(var(--p-transition-duration) * 1) ease-out,
    opacity calc(var(--p-transition-duration) * 0.75);
  transition-delay: calc(var(--p-transition-duration) * 0.5);
}
.header-menu-minimize-enter-from,
.header-menu-minimize-leave-to {
  margin-top: calc(-1 * 60px);
  opacity: 0;
}
</style>