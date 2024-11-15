<script setup lang="ts">
import {
  getAndSetUserProfile,
  askNotificationPermisstions,
  askTrackingPermissions,
} from "~/utilities/helpers"
import { initFileSystem } from "~/utilities/file-system"
import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import type { URLOpenListenerEvent } from "@capacitor/app"
import {
  //PushNotificationSchema,
  PushNotifications,
} from "@capacitor/push-notifications"
import type { ActionPerformed, Token } from "@capacitor/push-notifications"
import {
  useIsApp,
  useCurrentUserProfile,
  useGlobalToast,
  useIsNetworkConnected,
  useCurrentEpisode,
} from "~/composables/states"
import { useBrowserTopColor, useBrowserTopColorDarkMode } from "~/composables/globals"
import { initLocalNotifications } from "~/utilities/local-notifications"
import { Network } from "@capacitor/network"
import { updateAllLiveStreams } from "~/composables/data/liveStream"
import { useToast } from "primevue/usetoast"
import { initMediaSession } from "~/utilities/media-session.js"
import { useNewFeatureBadge } from "~/composables/useNewFeatureBadge"
import OneSignal from "onesignal-cordova-plugin"
// temp system to handle the new feature badge on the sleep timer
const { initFeatureSessionCount } = useNewFeatureBadge()
initFeatureSessionCount()

const toast = useToast()

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentUserProfile = useCurrentUserProfile()
const currentEpisode = useCurrentEpisode()
const browserTopColor = useBrowserTopColor()
const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const globalToast = useGlobalToast()
const isNetworkConnected = useIsNetworkConnected()
const isApp = useIsApp()

const fcmToken = ref("")
//const nNotification = ref(null)
const appLaunchUrl = ref(null)

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
// a func to refresh all data
const refreshData = async (streamOnly = false) => {
  if (streamOnly) {
    // refresh data here
    updateAllLiveStreams()
    //update media session
    initMediaSession(currentEpisode.value)
  } else {
    await getAndSetUserProfile()

    try {
      await refreshNuxtData()
    } catch (error) {
      console.error(error)
    }
    // refresh data here
    updateAllLiveStreams()
    //update media session
    initMediaSession(currentEpisode.value)
  }
}

// init the Network listener
Network.addListener("networkStatusChange", (status) => {
  isNetworkConnected.value = status.connected
  // refresh data here
  if (status.connected) {
    // refresh all data
    refreshData()
  }
})
// set the initial network status
const initNewtworkStatus = await Network.getStatus()
isNetworkConnected.value = initNewtworkStatus.connected

// adds listeners for push notifications and appStateChange and appUrlOpen
const addListeners = async () => {
  // Ask for notification permissions
  await askNotificationPermisstions()
  // Ask for tracking permissions (iOS only)
  await askTrackingPermissions()

  // On success, we should be able to receive notifications
  await PushNotifications.addListener("registration", (token: Token) => {
    fcmToken.value = token.value
    //alert('Push registration success, token: ' + token.value)
  })

  // Some issue with our setup and push will not work
  await PushNotifications.addListener("registrationError", (/* error: any */) => {
    //alert('Error on registration: ' + JSON.stringify(error))
  })

  // Show us the notification payload if the app is open on our device
  await PushNotifications.addListener(
    "pushNotificationReceived",
    (/* notification: PushNotificationSchema */) => {
      //nNotification.value = notification
      //alert('Push received: ' + JSON.stringify(notification))
    }
  )

  // Method called when tapping on a local notification
  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (notification: ActionPerformed) => {
      //nNotification.value = notification
      //alert('Push action performed: ' + JSON.stringify(notification))
      const slug = notification.notification.data.slug
      if (slug) {
        router.push(`/${slug}`)
      }
    }
  )
  // fired when the app becomes active (ios only)
  await App.addListener("appStateChange", (/* { isActive } */) => {
    //alert("App state changed. ", JSON.stringify(isActive))
  })

  // this is for deep links
  const client = useSupabaseClient()
  await App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
    //alert("App opened with URL: " + JSON.stringify(event))

    if (!event.url.startsWith("http")) {
      //if the url has a query var "code" then we need to exchange it for a session
      if (event.url.includes("code=")) {
        //when redirected to the app from a deep link, we need to exchange the url parame code for a session
        const code = event.url.split("=")[1]
        // for some reason, sometimes, the code has a '#' at the end of it, so we need to remove it
        const cleanCode = code.replace("#", "")
        try {
          await client.auth.exchangeCodeForSession(cleanCode)
          navigateTo("/")
          window.location.reload()
          return
        } catch (error) {
          console.error(error)
          toast.add({
            severity: "error",
            summary: "Authentication failed",
            life: 6000,
          })
          return
        }
      } else {
        // deep link
        const url = event.url.replace(/^.*?\/\/.*?\//, "/")
        //alert("url = " + url)
        navigateTo(url)
      }

      return
    }
    // if the url is a link to a web page, then open it in a new tab
    window.open(event.url, "_blank")
  })
}

// get the URL the app was loaded from (if any)
const checkAppLaunchUrl = async () => {
  const url = await App.getLaunchUrl()
  appLaunchUrl.value = url
  // so in the future, if we have it set up where certain URLs open the app, then we can read it and do something with it
  //alert("App opened with URL: " + JSON.stringify(url))
  // get data from UA
}

onMounted(async () => {
  await getAndSetUserProfile()

  if (isApp.value) {
    // init downloads files system for the app
    await initFileSystem()

    await addListeners()
    // if APP then add listeners
    await checkAppLaunchUrl()
    // init local notifications
    await initLocalNotifications()

    // OneSignal

    let myClickListener = async function (event) {
      let notificationData = JSON.stringify(event)
      alert("OneSignal notification clicked: " + notificationData)
    }
    OneSignal.Notifications.addEventListener("click", myClickListener)
    // OneSignal.Notifications.requestPermission(true).then((accepted: boolean) => {
    //   console.log("User accepted notifications: " + accepted);
    // });
    //OneSignal.setConsentRequired(false);
    OneSignal.initialize(`${config.public.ONESIGNAL_APP_ID}`)
    OneSignal.Notifications.requestPermission()
    //OneSignal.User.addEmail("example@domain.com");
    //OneSignal.User.addTags({key: "supabase_id", key2: "value2"});
    //OneSignal.User.addTags({"KEY_01": "VALUE_01", "KEY_02": "VALUE_02"});

    // const getTags = async () => {
    //   const tags = await OneSignal.User.getTags();
    //   console.log('Tags:', tags);
    // };

    //OneSignal.login("external_id");
    //OneSignal.logout();
    //OneSignal.User.getOnesignalId();
    //OneSignal.User.getExternalId();
  }

  //refresh data and check notification permissions every time the tab is in focus or the App is in focus
  document.addEventListener("visibilitychange", async () => {
    if (!document.hidden) {
      // update user profile when coming back from  the system settings
      if (isApp.value) {
        await PushNotifications.checkPermissions().then((result) => {
          if (result.receive === "denied") {
            currentUserProfile.value.receive_general_notifications = false
          }
          if (result.receive === "granted") {
            currentUserProfile.value.receive_general_notifications = true
          }
        })
      }
      // refresh stream only
      refreshData(true)
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
      summary: error,
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
      <Title> WNYC | New York Public Radio, Podcasts, Live Streaming Radio, News </Title>
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
          currentUserProfile?.dark_mode ? browserTopColorDarkMode : browserTopColor
        "
      />
      <Meta
        name="msapplication-TileColor"
        :content="
          currentUserProfile?.dark_mode ? browserTopColorDarkMode : browserTopColor
        "
      />
    </Head>
  </Html>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <NetworkBanner :connected="isNetworkConnected" />
  <AudioPlayer />
  <Sidebars class="z-2" />
  <Toast position="top-center" />
  <!-- <PullToRefresh /> -->
</template>
