<script setup lang="ts">
import {
  getAndSetUserProfile,
  refreshData,
  setStatusDarkMode,
} from "~/utilities/helpers"
import { initFileSystem } from "~/utilities/file-system"
import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import { ScreenOrientation } from "@capacitor/screen-orientation"
import type { URLOpenListenerEvent } from "@capacitor/app"
import {
  useIsApp,
  useCurrentUserProfile,
  useGlobalToast,
  useIsNetworkConnected,
  useIsActive,
} from "~/composables/states"
import {
  useBrowserTopColor,
  useBrowserTopColorDarkMode,
} from "~/composables/globals"
import useLiveStream from "~/composables/data/liveStream"
import { initLocalNotifications } from "~/utilities/local-notifications"
import { Network } from "@capacitor/network"
import { useToast } from "primevue/usetoast"
//import { useNewFeatureBadge } from "~/composables/useNewFeatureBadge"
import useOneSignal from "~/composables/useOneSignal"
import { useAuthReturnRoute } from "~/composables/useAuthReturnRoute"

const { fetchSchedule } = useLiveStream()

// temp system to handle the new feature badge on the sleep timer
//const { initFeatureSessionCount } = useNewFeatureBadge()
//initFeatureSessionCount()

const toast = useToast()

const route = useRoute()
const config = useRuntimeConfig()
const currentUserProfile = useCurrentUserProfile()
const browserTopColor = useBrowserTopColor()
const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const globalToast = useGlobalToast()
const isNetworkConnected = useIsNetworkConnected()
const isActiveGlobal = useIsActive()
const isApp = useIsApp()
const { initOneSignal, notificationPermissionSync, handleAppUrlOpen } =
  useOneSignal()

isApp.value = Capacitor.getPlatform() !== "web"

useHead({
  htmlAttrs: {
    lang: "en",
  },
  script: [],
  noscript: [],

  // bodyAttrs: {
  //   class: 'safe-area-padding',
  // },
})

// to clear all displayed toasts
const clearAllToasts = () => {
  toast.removeAllGroups()
}

// init the Network listener
Network.addListener("networkStatusChange", (status) => {
  if (!isNetworkConnected.value && status.connected) {
    setTimeout(() => {
      refreshData()
      clearAllToasts()
    }, 1000)
  }
  isNetworkConnected.value = status.connected
})

// set the initial network status
const initNetworkStatus = await Network.getStatus()
isNetworkConnected.value = initNetworkStatus.connected

// adds listeners for push notifications and appStateChange and appUrlOpen
const addListeners = async () => {
  await App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
    //Handle the app url open event
    handleAppUrlOpen(event)
  })
}

onMounted(async () => {
  // OneSignal
  if (isApp.value) initOneSignal()

  // check for stale auth return route
  const { checkStaleAuthRoute } = useAuthReturnRoute()
  await checkStaleAuthRoute()

  await getAndSetUserProfile()

  if (isApp.value) {
    await ScreenOrientation.lock({ orientation: "portrait" })
    await initFileSystem()
    await addListeners()
    await initLocalNotifications()

    // initial check for notification permission
    await notificationPermissionSync(undefined)
  }

  // initial fetch of the schedule to start the live stream refresh loop
  fetchSchedule()

  // fired when the app becomes active
  //refresh data and check notifications permissions every time the tab is in focus or the App is in focus
  await App.addListener("appStateChange", async ({ isActive }) => {
    // set global active state
    isActiveGlobal.value = isActive
    if (isActive) {
      // refresh data
      refreshData()

      // update user profile when coming back from the system settings
      if (isApp.value) {
        await notificationPermissionSync(undefined)
      }

      // set the system status bar to dark mode again
      await setStatusDarkMode(currentUserProfile.value?.dark_mode)
    }
  })

  //every time the cursor enters the window on desktop only
  // if (isDesktop) {
  //   document.addEventListener("pointerenter", () => {})
  // }

  // Ads
  window.htlbid = window.htlbid || {}
  htlbid.cmd = htlbid.cmd || []
  htlbid.cmd.push(() => {
    htlbid.layout("universal") // Leave as 'universal' or add custom layout
    htlbid.setTargeting("is_testing", config.public.HTL_IS_TESTING) // Set to "no" for production
    htlbid.setTargeting("is_home", route.name === "index" ? "yes" : "no") // Set to "yes" on the homepage
    htlbid.setTargeting("category", route.name) // dynamically pass page category into this function
    htlbid.setTargeting("post_id", route.name) // dynamically pass unique post/page id into this function
  })
})

useHead({
  script: [
    {
      src: config.public.HTL_JS,
      async: true,
    },
  ],
})

watch(globalToast, (optionsObj) => {
  if (optionsObj) {
    toast.add(optionsObj)
  }
})

const globalError = useError()

watch(globalError, (error) => {
  if (error) {
    toast.add({
      severity: "error",
      summary: `${error}`,
      life: 6000,
    })
  }
})
</script>

<template>
  <Html lang="en">
    <Head>
      <Link rel="canonical" :href="`https://wnyc.org${route.path}`" />
      <Link rel="stylesheet" :href="config.public.HTL_CSS" type="text/css" />
      <Title>
        WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News
      </Title>
      <Meta
        name="description"
        content="WNYC is America's most listened-to public radio station and the producer of award-winning programs and podcasts like Radiolab, On the Media, and The Brian Lehrer Show."
      />
      <Meta
        name="keywords"
        content="wnyc, podcasts, npr, new york, WNYC Studios, arts, culture, classical, music, news, public, radio"
      />
      <Meta
        name="og:site_name"
        content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
      />
      <Meta name="og:type" content="website" />
      <Meta name="og:url" :content="`https://www.wnyc.org${route.fullPath}`" />
      <Meta
        name="og:title"
        content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
      />
      <Meta
        name="og:description"
        content="WNYC is America's most listened-to public radio station and the producer of award-winning programs and podcasts like Radiolab, On the Media, and The Brian Lehrer Show."
      />
      <Meta
        name="og:image"
        content="https://media.wnyc.org/i/1200/1200/c/80/1/wnyc_square_logo.png"
      />
      <Meta name="og:image:alt" content="WNYC" />
      <Meta name="og:image:width" content="1200" />
      <Meta name="og:image:height" content="600" />
      <Meta name="fb:app_id" content="151261804904925" />
      <Meta name="twitter:card" content="summary_large_image" />
      <Meta name="twitter:site" content="@radiolab" />
      <Meta name="twitter:title" content="WNYC" />
      <Meta
        name="twitter:description"
        content="WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
      />
      <Meta
        name="twitter:image"
        content="https://media.wnyc.org/i/1200/1200/c/80/1/wnyc_square_logo.png"
      />
      <Meta
        name="theme-color"
        :content="
          currentUserProfile?.dark_mode
            ? browserTopColorDarkMode
            : browserTopColor
        "
      />
      <Meta
        name="msapplication-TileColor"
        :content="
          currentUserProfile?.dark_mode
            ? browserTopColorDarkMode
            : browserTopColor
        "
      />
    </Head>
  </Html>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div id="anchor"></div>
  <VProgressBar />
  <NetworkBanner :connected="isNetworkConnected" />
  <AudioPlayer />
  <Drawers class="z-2" />
  <Toast position="top-center" successIcon="ci-check" warnIcon="ci-warn" />
  <!-- <PullToRefresh v-if="isApp" /> -->
</template>
