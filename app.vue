<script setup lang="ts">
import { trackClickEvent } from '~/utilities/helpers'
import { NewRelicCapacitorPlugin, NREnums, AgentConfiguration } from '@newrelic/newrelic-capacitor-plugin';
import { Capacitor } from '@capacitor/core'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications'
import { useSettingSideBar, useIsApp } from '~/composables/states'
import { LocalNotifications } from '@capacitor/local-notifications'
import { updateAllLiveStreams } from '~/composables/data/liveStream'
//import { Browser } from '@capacitor/browser'
const { isDesktop } = useDevice()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const isRefreshing = shallowRef(false)
const acceptNotifications = shallowRef(false)

const settingsSideBar = useSettingSideBar()
const isApp = useIsApp()

const fcmToken = ref('')
//const nNotification = ref(null)
// const appLaunchUrl = ref(null)

isApp.value = Capacitor.getPlatform() !== 'web'

useHead({
  htmlAttrs: {
    lang: 'en',
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
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register()
        acceptNotifications.value = true
      } else {
        //alert('Error Reguistering push notifications')
        acceptNotifications.value = false
      }
    })

    //Check permission to use push notifications for ANDROID ONLY
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.requestPermissions().then((result) => {
        //alert('local request = ' + JSON.stringify(result))
        if (result.display === 'granted') {
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
  await PushNotifications.addListener('registration', (token: Token) => {
    fcmToken.value = token.value
    //alert('Push registration success, token: ' + token.value)
  })

  // Some issue with our setup and push will not work
  await PushNotifications.addListener('registrationError', (error: any) => {
    //alert('Error on registration: ' + JSON.stringify(error))
  })

  // Show us the notification payload if the app is open on our device
  await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      //nNotification.value = notification
      //alert('Push received: ' + JSON.stringify(notification))
    }
  )

  // Method called when tapping on a notification
  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
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
  await App.addListener('appStateChange', ({ isActive }) => {
    //alert('App state changed. Is active?', JSON.stringify(isActive))
  })

  // this is for deep links
  await App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
    //alert('appUrlOpen')
    //Browser.close()
    //when redirected to the app rom a deep link, I have to see if the URL is a oauth link, where I have to set the session from it and route to the home page, or another link where I have to route based on the URL
    // const slug = event.url.split('.app').pop()
    // if (slug) {
    //   router.push(slug)
    // }
    // If no match, do nothing - let regular routing
    // logic take over
  })
}

// const checkAppLaunchUrl = async () => {
//   const url = await App.getLaunchUrl()
//   appLaunchUrl.value = url
//   // so in the future, if we have it set up where certain URLs open the app, then we can read it and do something with it
//   alert('App opened with URL: ' + JSON.stringify(url))
// }

onMounted(async () => {
  //initially load all the streams
  await nextTick()
  updateAllLiveStreams()

  // if APP then add listeners
  if (isApp.value) {
    addListeners()
    //checkAppLaunchUrl()
  }

  //New Relic Instrumentation
  let appToken;
  if (Capacitor.getPlatform() === 'ios') {
    appToken = 'AA731b117edcff278d3a204187b46ab3d347a16888-NRMA'
  } else {
    appToken = 'AA8cda4e9935230376ef2dad8356c3b9bada1365df-NRMA'
  }

  let agentConfig: AgentConfiguration = {
    // Android specific option
    // Optional: Enable or disable collection of event data.
    analyticsEventEnabled: true,

    // iOS specific option
    // Optional: Enable/Disable automatic instrumentation of WebViews.
    webViewInstrumentation: true,

    // Optional: Enable or disable crash reporting.
    crashReportingEnabled: true,

    // Optional: Enable or disable interaction tracing. Trace instrumentation still occurs, but no traces are harvested. This will disable default and custom interactions.
    interactionTracingEnabled: true,

    // Optional: Enable or disable reporting successful HTTP requests to the MobileRequest event type.
    networkRequestEnabled: true,

    // Optional: Enable or disable reporting network and HTTP request errors to the MobileRequestError event type.
    networkErrorRequestEnabled: true,

    // Optional: Enable or disable capture of HTTP response bodies for HTTP error traces, and MobileRequestError events.
    httpResponseBodyCaptureEnabled: true,

    // Optional: Enable or disable agent logging.
    loggingEnabled: true,

    // Optional: Specifies the log level. Omit this field for the default log level.
    // Options include: ERROR (least verbose), WARNING, INFO, VERBOSE, AUDIT (most verbose).
    logLevel: NREnums.LogLevel.INFO,

    // Optional: Enable or disable sending JS console logs to New Relic.
    sendConsoleEvents: true
  }

  NewRelicCapacitorPlugin.start({ appKey: appToken, agentConfiguration: agentConfig })

  //refresh data and check notification permissions every time the tab is in focus or the App is in focus
  document.addEventListener('visibilitychange', (event) => {
    if (!document.hidden) {
      checkNotificationPermisstions()
      updateAllLiveStreams()
      isRefreshing.value = true
      setTimeout(() => {
        isRefreshing.value = false
      }, 1500)
    }
  })
  //refresh data every time the cursor enters the window on desktop only
  if (isDesktop) {
    document.addEventListener('pointerenter', () => {
      updateAllLiveStreams()
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
    htlbid.layout('universal') // Leave as 'universal' or add custom layout
    htlbid.setTargeting('is_testing', config.public.HTL_IS_TESTING) // Set to "no" for production
    htlbid.setTargeting('is_home', route.name === 'index' ? 'yes' : 'no') // Set to "yes" on the homepage
    htlbid.setTargeting('category', route.name) // dynamically pass page category into this function
    htlbid.setTargeting('post_id', route.name) // dynamically pass unique post/page id into this function
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
    </Head>
  </Html>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <Sidebar
    v-model:visible="settingsSideBar"
    :baseZIndex="10000"
    position="right"
    class="w-full"
    blockScroll
    id="settings-sidebar"
    @hide="
      () => {
        trackClickEvent(
          'Click Tracking - Settings Sidebar Close Button',
          'Settings Sidebar',
          `close sidebar`
        )
      }
    "
  >
    <template #header><h1 class="font-medium">Settings</h1></template>
    <Settings />
  </Sidebar>
  <AudioPlayer />
</template>

<style lang="scss">
#settings-sidebar {
  padding-top: env(safe-area-inset-top);
  background-color: var(--background2);
  .p-sidebar-header {
    padding: 0.75rem 0.75rem 0.75rem 1.25rem;
    justify-content: space-between;
  }
  .p-sidebar-content {
    padding: 0;
  }
  .p-sidebar-close {
    width: 32px !important;
    height: 32px !important;
  }
  .p-sidebar-close,
  .p-sidebar-close .p-icon {
    width: 18px;
    height: 18px;
    path {
      fill: var(--night);
    }
  }
}
</style>
