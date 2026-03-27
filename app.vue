<script setup lang="ts">
import {
  getAndSetUserProfile,
  refreshData,
  getFullDeviceInfo,
  getAppDownloadLink,
} from "~/utilities/helpers"
import { initFileSystem } from "~/utilities/file-system"
import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import type { URLOpenListenerEvent } from "@capacitor/app"
import {
  useIsApp,
  useCurrentUserProfile,
  useGlobalToast,
  useIsNetworkConnected,
  useFullDeviceInfo,
  useAppDownloadLink,
} from "~/composables/states"
import {
  useBrowserTopColor,
  useBrowserTopColorDarkMode,
} from "~/composables/globals"
import useLiveStream from "~/composables/data/liveStream"
import { initLocalNotifications } from "~/utilities/local-notifications"
import { Network } from "@capacitor/network"
import { useToast } from "primevue/usetoast"
import { getGtmHeadConfig } from "~/utilities/gtm"
//import { useNewFeatureBadge } from "~/composables/useNewFeatureBadge"
import useOneSignal from "~/composables/useOneSignal"

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
const fullDeviceInfo = useFullDeviceInfo()
const appDownloadLink = useAppDownloadLink()
const isApp = useIsApp()

// Only initialize OneSignal on client-side to avoid SSR errors
let initOneSignal: any, notificationPermissionSync: any, handleAppUrlOpen: any
if (import.meta.client) {
  const oneSignal = useOneSignal()
  initOneSignal = oneSignal.initOneSignal
  notificationPermissionSync = oneSignal.notificationPermissionSync
  handleAppUrlOpen = oneSignal.handleAppUrlOpen
}

const isWeb = Capacitor.getPlatform() === "web"
isApp.value = !isWeb
const gtmHeadConfig = getGtmHeadConfig({
  isWeb,
  gtmId: config.public.GTM_ID,
})

// Initialize device info and app download link asynchronously
const initializeDeviceInfo = async () => {
  fullDeviceInfo.value = await getFullDeviceInfo()
  appDownloadLink.value = await getAppDownloadLink()
}
initializeDeviceInfo()

useHead({
  htmlAttrs: {
    lang: "en",
    class: isApp.value ? "app" : "browser",
  },
  script: [...gtmHeadConfig.script],
  noscript: [...gtmHeadConfig.noscript],

  bodyAttrs: {},
})

// to clear all displayed toasts
const clearAllToasts = () => {
  toast.removeAllGroups()
}

// adds listeners for push notifications and appStateChange and appUrlOpen
const addListeners = async () => {
  await App.addListener("appUrlOpen", (event: URLOpenListenerEvent) => {
    //Handle the app url open event
    handleAppUrlOpen(event)
  })
}

onMounted(async () => {
  // Initialize Capacitor platform detection (client-side only)
  isApp.value = Capacitor.getPlatform() !== "web"

  // Initialize device info and app download link asynchronously (client-side only)
  fullDeviceInfo.value = await getFullDeviceInfo()
  appDownloadLink.value = await getAppDownloadLink()

  // Init the Network listener (client-side only)
  Network.addListener("networkStatusChange", (status) => {
    if (!isNetworkConnected.value && status.connected) {
      setTimeout(() => {
        refreshData()
        clearAllToasts()
      }, 1000)
    }
    isNetworkConnected.value = status.connected
  })

  // Set the initial network status (client-side only)
  const initNetworkStatus = await Network.getStatus()
  isNetworkConnected.value = initNetworkStatus.connected

  // OneSignal
  if (isApp.value) initOneSignal()

  await getAndSetUserProfile()

  if (isApp.value) {
    await initFileSystem()
    await addListeners()
    await initLocalNotifications()

    // initial check for notification permission
    await notificationPermissionSync()
  }

  // initial fetch of the schedule to start the live stream refresh loop
  fetchSchedule()

  // fired when the app becomes active
  //refresh data and check notifications permissions every time the tab is in focus or the App is in focus
  await App.addListener("appStateChange", async ({ isActive }) => {
    if (isActive && isApp.value) {
      // refresh data
      refreshData()

      // update user profile when coming back from the system settings
      if (isApp.value) {
        await notificationPermissionSync()
      }
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

const title = "WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News"
const description = "WNYC is America's most listened-to public radio station and the producer of award-winning programs and podcasts like Radiolab, On the Media, and The Brian Lehrer Show."
useHead({
  title,
  script: [
    {
      src: config.public.HTL_JS,
      async: true,
    },
  ],
  link: [
    {
      rel: "canonical",
      href: `https://wnyc.org${route?.path}`,
    },
    {
      rel: "stylesheet",
      href: config.public.HTL_CSS,
    }
  ],
})
useSeoMeta({
  title,
  description,
  keywords: "wnyc, podcasts, npr, new york, WNYC Studios, arts, culture, classical, music, news, public, radio",
  type: "website",
  ogUrl: `https://wnyc.org${route?.path}`,
  ogImage: "https://media.wnyc.org/i/1200/1200/c/80/1/wnyc_square_logo.png",
  ogImageAlt: "WNYC Logo",
  ogImageWidth: 1200,
  ogImageHeight: 600,
  ogFacebookAppId: "151261804904925",
  siteName: "WNYC",
  twitterCard: "summary_large_image",
  twitterSite: "@radiolab",
  themeColor: currentUserProfile?.dark_mode ? browserTopColorDarkMode : browserTopColor,
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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <div id="anchor"></div>
  <VProgressBar />
  <NetworkBanner :connected="isNetworkConnected" />
  <AudioPlayer />
  <Drawers class="z-2" />
  <DynamicDialog />
  <Toast position="top-center" successIcon="ci-check" warnIcon="ci-warn" />

  <!-- Inline SVG filter for Safari compatibility - Safari doesn't support data URI SVG filters -->
  <svg
    aria-hidden="true"
    style="position: absolute; width: 0; height: 0; overflow: hidden"
  >
    <defs>
      <filter
        id="v-image-blur-filter"
        x="0"
        y="0"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feGaussianBlur stdDeviation="38" result="blurred" />
        <feMorphology operator="dilate" radius="38" />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="blurred" />
        </feMerge>
      </filter>
    </defs>
  </svg>
</template>
