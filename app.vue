<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications'
import { LocalNotifications } from '@capacitor/local-notifications'
import {
  NativeSettings,
  AndroidSettings,
  IOSSettings,
} from 'capacitor-native-settings'
import { updateAllLiveStreams } from '~/composables/data/liveStream'

const { isDesktop } = useDevice()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const isRefreshing = shallowRef(false)
const acceptNotifications = shallowRef(false)

const fcmToken = ref('')
//const nNotification = ref(null)
// const appLaunchUrl = ref(null)

const isApp = shallowRef(Capacitor.getPlatform() !== 'web')

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
})

const addListeners = async () => {
  await checkNotificationPermisstions()

  // On success, we should be able to receive notifications
  await PushNotifications.addListener('registration', (token: Token) => {
    fcmToken.value = token.value
    alert('Push registration success, token: ' + token.value)
  })

  // Some issue with our setup and push will not work
  await PushNotifications.addListener('registrationError', (error: any) => {
    alert('Error on registration: ' + JSON.stringify(error))
  })

  // Show us the notification payload if the app is open on our device
  await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: PushNotificationSchema) => {
      //nNotification.value = notification
      alert('Push received: ' + JSON.stringify(notification))
    }
  )

  // Method called when tapping on a notification
  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification: ActionPerformed) => {
      //nNotification.value = notification
      alert('Push action performed: ' + JSON.stringify(notification))
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
    // Example url: https://beerswift.app/tabs/tab2
    // slug = /tabs/tab2
    const slug = event.url.split('.app').pop()
    if (slug) {
      router.push(slug)
    }
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

const checkNotificationPermisstions = async () => {
  if (isApp.value) {
    // Request permission to use push notifications
    // iOS will prompt user and return if they granted permission or not
    // Android will just grant without prompting
    await PushNotifications.requestPermissions().then((result) => {
      alert('push request' + JSON.stringify(result))
      if (result.receive === 'granted') {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register()
        acceptNotifications.value = true
      } else {
        //alert('Error Reguistering push notifications')
        acceptNotifications.value = false
      }
    })

    // Check permission to use push notifications for ANDROID ONLY
    if (Capacitor.getPlatform() === 'android') {
      await LocalNotifications.requestPermissions().then((result) => {
        alert('local request = ' + JSON.stringify(result))
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

const toSystemSettings = async () => {
  NativeSettings.open({
    optionAndroid: AndroidSettings.ApplicationDetails,
    optionIOS: IOSSettings.App,
  })
}

onMounted(async () => {
  //initially load all the streams
  await nextTick()

  updateAllLiveStreams()

  // if APP then add listeners
  if (isApp.value) {
    //addListeners()
    //checkAppLaunchUrl()
  }

  //refresh data and check notification permissions every time the tab is in focus or the App is in focus
  document.addEventListener('visibilitychange', (event) => {
    if (!document.hidden) {
      //console.log('focused tab =', event)
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
      //console.log('pointerenter = ', event)
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
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
