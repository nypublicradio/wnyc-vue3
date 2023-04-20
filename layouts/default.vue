<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications'
import { useNavigation } from '~/composables/states'
import { updateAllLiveStreams } from '~/composables/data/liveStream'
const { isMobile, isDesktop } = useDevice()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const isRefreshing = ref(false)

const fcmToken = ref('')
//const nNotification = ref(null)
// const appLaunchUrl = ref(null)

const isApp = ref(Capacitor.getPlatform() !== 'web')

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
  // Request permission to use push notifications
  // iOS will prompt user and return if they granted permission or not
  // Android will just grant without prompting
  await PushNotifications.requestPermissions().then((result) => {
    if (result.receive === 'granted') {
      // Register with Apple / Google to receive push via APNS/FCM
      PushNotifications.register()
    } else {
      alert('Error Reguistering push notifications')
    }
  })

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
  // fired when the abecomes active
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

onMounted(() => {
  //initially load all the streams
  updateAllLiveStreams()
  //refresh data every time the tab is in focus
  document.addEventListener('visibilitychange', (event) => {
    if (!document.hidden) {
      //console.log('focused tab =', event)
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
})

onMounted(() => {
  if (isApp.value) {
    addListeners()
    //checkAppLaunchUrl()
  }
})

onMounted(() => {
  // Ads
  window.htlbid = window.htlbid || {}
  htlbid.cmd = htlbid.cmd || []
  htlbid.cmd.push(function () {
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
let navigationState = useNavigation()
onMounted(async () => {
  // // get the navigation data from Aviary
  const { data: navigation } = await useFetch(config.public.NAVIGATION_API)
  // // update the state with the navigation data

  navigationState.value = navigation.value
})
</script>

<template>
  <div class="page" :class="[`${String(route.name)}`]">
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
        <Meta
          name="og:url"
          :content="`https://www.wnyc.org${route.fullPath}`"
        />
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
    <div class="top-safe-cover" />
    <TheHeader v-if="navigationState" />
    <main>
      <div class="dots" />
      <div class="content">
        <input :value="fcmToken" />
        <!-- <div class="px-4">
          <p>fcm token =</p>
          <input :value="fcmToken" />
          <pre></pre>
          <p>appLaunchUrl = {{ appLaunchUrl }}</p>
          <p>Notification = {{ nNotification }}</p>
          <h4>Capacitor's JavaScript API</h4>
          <h6>
            Platform (web | ios | android) = {{ Capacitor.getPlatform() }}
          </h6>
          <h6>isNativePlatform = {{ Capacitor.isNativePlatform() }}</h6>
          <h6>
            isPluginAvailable('Camera') =
            {{ Capacitor.isPluginAvailable('Camera') }}
          </h6>
        </div> -->

        <!-- <Transition name="refresh">
          <div
            v-if="isRefreshing"
            class="fixed flex align-items-center justify-content-center w-full mt-2"
          >
            <i
              class="pi pi-spin pi-spinner text-white text-lg mr-2"
              style="font-size: 2rem"
            ></i>
            <p>REFRESHING</p>
          </div>
        </Transition> -->
        <slot />
      </div>
    </main>
    <TheFooter v-if="navigationState" />
    <AudioPlayer />
  </div>
</template>

<style lang="scss">
.refresh-enter-active,
.refresh-leave-active {
  transition: opacity 0.5s ease;
}

.refresh-enter-from {
  opacity: 0;
}
.refresh-leave-to {
  opacity: 0;
}
.content {
  z-index: 10;
  position: relative;
}
</style>
