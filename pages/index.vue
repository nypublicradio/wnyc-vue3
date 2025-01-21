<script setup async>

import { setStatusDarkMode, trackClickEvent } from "~/utilities/helpers"
import { useCurrentUserProfile } from "~/composables/states.ts"
import { useBrowserTopColorDarkMode } from "~/composables/globals.ts"
import { useSignupSideBar, useLoginSideBar } from "~/composables/states"

useHead({
  bodyAttrs: {
    class: "no-bottom-padding hide-bottom-menu solid-bg",
  },
})

definePageMeta({
  layout: "default",
  middleware: ["check-auth-provider"],
})

const loginSideBar = useLoginSideBar()
const signupSideBar = useSignupSideBar()

const currentUserProfile = useCurrentUserProfile()
const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const route = useRoute()
const isLoading = shallowRef(true)

/* track the skip this button */
const onSkipThis = () => {
  trackClickEvent("Click Tracking - Skip This button", "welcome screen", "skip-button")
}

/* track the create free account button and open the signup side bar */
const createFreeAccount = () => {
  trackClickEvent(
    "Click Tracking - Create Free Account button",
    "welcome screen",
    "signup-button"
  )
  signupSideBar.value = true
}

/* track the login button and open the login side bar */
const login = () => {
  trackClickEvent("Click Tracking - Login button", "welcome screen", "login-button")
  loginSideBar.value = true
}

onBeforeMount(() => {
  // this page has the body class "style-mode-dark", so we need to force the status bar to be dark as well
  setStatusDarkMode(true)
})

onMounted(() => {
  // send GA page view
  const { $analytics } = useNuxtApp()
  $analytics.sendPageView({
    page_title: "Login",
    page_type: "login_page",
    content_group: "login",
  })
  setTimeout(() => {
    // if no redirect has happened, we can hide the loader
    isLoading.value = false
    //showError("home Fatal error")
  }, 1500)
})
onUnmounted(() => {
  // check if are set to light mode first, if yes, then set the status bar back to light mode
  setStatusDarkMode(currentUserProfile.value?.dark_mode)
})
</script>
<template>
  <div>
    <Html>
      <Head>
        <Title>WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News</Title>
        <Meta
          name="og:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <Meta
          name="twitter:title"
          content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
        />
        <!-- force browser top color dark -->
        <Meta name="theme-color" :content="browserTopColorDarkMode" />
        <Meta name="msapplication-TileColor" :content="browserTopColorDarkMode" />
      </Head>
    </Html>
    <div class="page style-mode-dark" :class="[`${String(route.name)}`]">
      <Transition name="fade">
        <section v-if="isLoading" class="loading-holder">
          <WnycLoader class="loader-anim" />
        </section>
        <div v-else class="index-page flex flex-column">
          <section class="flex flex-column">
            <WnycLogo class="w-12rem m-auto mb-6 flex-none" />
            <h1 class="headline">What's new?</h1>
            <ul class="list m-auto mt-4 mb-6">
              <li>Improved live streaming experience</li>
              <li>Daily schedule at your fingertips</li>
              <li>Save & follow your favorite podcasts</li>
              <li>Local news stories from Gothamist</li>
              <li>All day updates from WNYC & NPR</li>
              <li>New look: light & dark themes</li>
            </ul>
            <h1 class="headline mb-4">Get started!</h1>
            <div class="text-center flex flex-column gap-3 mb-4">
              <Button
                class="w-13rem m-auto"
                label="Create Free Account"
                aria-label="Create Free Account"
                rounded
                size="small"
                @click="createFreeAccount"
              />

              <p>or</p>

              <Button
                class="w-13rem m-auto"
                label="Log in"
                aria-label="Log in"
                rounded
                size="small"
                severity="secondary"
                @click="login"
              />
              <p>
                <VFlexibleLink to="/home" @click="onSkipThis">Skip this</VFlexibleLink>,
                I'll create an account later.
              </p>
            </div>
          </section>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.loading-holder {
  display: flex;
  position: absolute;
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  width: 100vw;
  left: 0;
  right: 0;

  .loader-anim {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 100px;
    height: 50px;
  }
}
.index-page {
  height: calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom));
  .headline {
    font-size: 30px;
    text-align: center;
    letter-spacing: -0.6px;
    font-family: $fontFamilyTisa;
  }
  .list {
    li {
      font-size: 1rem;
      line-height: normal;
      margin-bottom: 0.5rem;
      letter-spacing: 0.32px;
    }
  }
}
</style>
