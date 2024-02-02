<script setup lang="ts">
import { /* trackClickEvent, */ getAndSetUserProfile } from "~/utilities/helpers"
import { updateFileSystem, initReadOfPreferences } from "~/utilities/file-system"

import { Capacitor } from "@capacitor/core"
import { App } from "@capacitor/app"
import type { URLOpenListenerEvent } from "@capacitor/app"
import { Preferences } from "@capacitor/preferences"
import {
  //PushNotificationSchema,
  PushNotifications,
} from "@capacitor/push-notifications"
import type { ActionPerformed, Token } from "@capacitor/push-notifications"
import {
  useIsApp,
  useCurrentUserProfile,
  useGlobalToast,
  useFileSystemLS,
  //useHomepageData,
} from "~/composables/states"
import { useBrowserTopColor, useBrowserTopColorDarkMode } from "~/composables/globals"
import { LocalNotifications } from "@capacitor/local-notifications"

import { useToast } from "primevue/usetoast"

const toast = useToast()

const { isDesktop } = useDevice()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const currentUserProfile = useCurrentUserProfile()
const browserTopColor = useBrowserTopColor()
const browserTopColorDarkMode = useBrowserTopColorDarkMode()
const globalToast = useGlobalToast()
const fileSystemLS = useFileSystemLS()

const isRefreshing = shallowRef(false)
const acceptNotifications = shallowRef(false)

const isApp = useIsApp()

const fcmToken = ref("")
//const nNotification = ref(null)
const appLaunchUrl = ref(null)

isApp.value = Capacitor.getPlatform() !== "web"

// const homepageData = useHomepageData()
// const { data: homepageFetchData } = await useFetch(
//   `${config.public.BFF_URL}/api/homepage`
// )
// homepageData.value = homepageFetchData

useHead({
  htmlAttrs: {
    lang: "en",
  },
  script: [
    {
      src: `https://www.googletagmanager.com/gtag/js?id=${config.public.GA_MEASUREMENT_ID}`,
      async: true,
    },
  ],
  noscript: [
    {
      children: `<iframe src=&quot;https://www.googletagmanager.com/ns.html?id=${config.public.GTM_ID}&quot;
    height=&quot;0&quot; width=&quot;0&quot; style=&quot;display:none;visibility:hidden&quot;></iframe>`,
    },
  ],

  // bodyAttrs: {
  //   class: 'safe-area-padding',
  // },
})

// handles the permissions for push notifications in the app
const checkNotificationPermisstions = async () => {
  if (isApp.value) {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    await PushNotifications.requestPermissions().then((result) => {
      //alert('push request' + JSON.stringify(result))
      if (result.receive === "granted") {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register()
        acceptNotifications.value = true
      } else {
        //alert('Error Reguistering push notifications')
        acceptNotifications.value = false
      }
    })

    //Check permission to use push notifications for ANDROID ONLY
    if (Capacitor.getPlatform() === "android") {
      await LocalNotifications.requestPermissions().then((result) => {
        //alert('local request = ' + JSON.stringify(result))
        if (result.display === "granted") {
          PushNotifications.register()
          acceptNotifications.value = true
        } else {
          acceptNotifications.value = false
        }
      })
    }
  }
}

// adds listeners for push notifications and appStateChange and appUrlOpen
const addListeners = async () => {
  await checkNotificationPermisstions()

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

  // Method called when tapping on a notification
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
  // fired when the app becomes active
  await App.addListener("appStateChange", (/* { isActive } */) => {
    //alert('App state changed. Is active?', JSON.stringify(isActive))
  })

  // this is for deep links
  const client = useSupabaseClient()
  await App.addListener("appUrlOpen", async (event: URLOpenListenerEvent) => {
    //when redirected to the app from a deep link, we need to exchange the url parame code for a session
    //alert("event = " + JSON.stringify(event))
    //console.log("event = ", event)
    const code = event.url.split("=")[1]
    //alert("code = " + JSON.stringify(code))
    // for some reason, sometimes, the code has a '#' at the end of it, so we need to remove it
    const cleanCode = code.replace("#", "")
    //console.log("code = ", code)
    if (cleanCode) {
      //alert("cleanCode = " + JSON.stringify(cleanCode))
      await client.auth.exchangeCodeForSession(cleanCode)
      //alert("route")
      navigateTo("/")
      //alert("refresh")
      window.location.reload()
    } else {
      // show toast error
      toast.add({
        severity: "error",
        summary: "Authentication failed",
        life: 6000,
      })
    }
  })
}

// get the URL the app was loaded from (if any)
const checkAppLaunchUrl = async () => {
  const url = await App.getLaunchUrl()
  appLaunchUrl.value = url
  // so in the future, if we have it set up where certain URLs open the app, then we can read it and do something with it
  //alert("App opened with URL: " + JSON.stringify(url))
}

onMounted(async () => {
  await getAndSetUserProfile()

  // if APP then add listeners
  if (isApp.value) {
    addListeners()
    checkAppLaunchUrl()
  }

  //refresh data and check notification permissions every time the tab is in focus or the App is in focus
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      checkNotificationPermisstions()
      isRefreshing.value = true
      setTimeout(() => {
        isRefreshing.value = false
      }, 1500)
    }
  })
  //refresh data every time the cursor enters the window on desktop only
  if (isDesktop) {
    document.addEventListener("pointerenter", () => {
      isRefreshing.value = true
      setTimeout(() => {
        isRefreshing.value = false
      }, 1500)
    })
  }

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

onMounted(async () => {
  // init downloads files system for the app
  fileSystemLS.value = await initReadOfPreferences()
  updateFileSystem()
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

  <AudioPlayer />
  <Sidebars />
  <Toast position="top-center" />
</template>
