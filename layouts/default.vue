<script setup lang="ts">
import { Capacitor } from '@capacitor/core'
import { App, URLOpenListenerEvent } from '@capacitor/app'
import { PushNotifications } from '@capacitor/push-notifications'
import {
  useCurrentSteamStation,
  useAllCurrentEpisodes,
  useNavigation,
} from '~/composables/states'
import {
  updateAllLiveStreams,
  updateLiveStream,
} from '~/composables/data/liveStream'

const currentSteamStation = useCurrentSteamStation()
const allCurrentEpisodes = useAllCurrentEpisodes()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const fcmToken = ref('')
const nUrl = ref(null)
const nError = ref(null)
const nNotification = ref(null)
const nActionId = ref(null)
const nInputValue = ref(null)
const getNotificationList = ref(null)
const routeSlugEvent = ref('')
const appLaunchUrl = ref(null)

const isApp = ref(Capacitor.getPlatform() !== 'web')

const addListeners = async () => {
  await PushNotifications.addListener('registration', (token: any) => {
    fcmToken.value = token.value
    console.info('Registration token: ', token.value)
  })

  await PushNotifications.addListener('registrationError', (err: any) => {
    nError.value = err
    console.error('Registration error: ', err.error)
  })

  await PushNotifications.addListener(
    'pushNotificationReceived',
    (notification: any) => {
      nNotification.value = notification.data.slug
      //router.push({ path: `/${notification.data.slug}` })
      console.log('Push notification received: ', notification)
    }
  )

  await PushNotifications.addListener(
    'pushNotificationActionPerformed',
    (notification: any) => {
      nActionId.value = notification.actionId
      nInputValue.value = notification.inputValue
      console.log(
        'Push notification action performed',
        notification.actionId,
        notification.inputValue
      )
      if (notification.actionId === 'tap' && nNotification.value !== null) {
        router.push(`/${nNotification.value}`)
        //navigateTo(nNotification.value.slug)
      }
    }
  )
  await App.addListener('appUrlOpen', function (event: URLOpenListenerEvent) {
    // Example url: https://beerswift.app/tabs/tabs2
    // slug = /tabs/tabs2
    const slug = event.url.split('.app').pop()
    routeSlugEvent.value = event.url
    // We only push to the route if there is a slug present
    if (slug) {
      router.push({ path: slug })
    }
  })
  await App.addListener('appStateChange', ({ isActive }) => {
    console.log('App state changed. Is active?', isActive)
  })

  await App.addListener('appRestoredResult', (data) => {
    console.log('Restored state:', data)
  })
}

const registerNotifications = async () => {
  let permStatus = await PushNotifications.checkPermissions()

  if (permStatus.receive === 'prompt') {
    permStatus = await PushNotifications.requestPermissions()
  }

  if (permStatus.receive !== 'granted') {
    throw new Error('User denied permissions!')
  }

  await PushNotifications.register()
}

const getDeliveredNotifications = async () => {
  const notificationList = await PushNotifications.getDeliveredNotifications()
  getNotificationList.value = notificationList
  console.log('delivered notifications', notificationList)
}

const checkAppLaunchUrl = async () => {
  const url = await App.getLaunchUrl()
  appLaunchUrl.value = url
  console.log('App opened with URL: ' + url)
}

onBeforeMount(() => {
  updateLiveStream(currentSteamStation.value)
  updateAllLiveStreams()
  if (isApp.value) {
    registerNotifications()
    addListeners()
    getDeliveredNotifications()
    checkAppLaunchUrl()
  }
})

// get the navigation data from Aviary
const { data: navigation } = await useFetch(config.NAVIGATION_API)
// update the state with the navigation data
let navigationState = useNavigation()
navigationState.value = navigation.value
</script>

<template>
  <div class="page" :class="[`${route.name}`]">
    <Html lang="en">
      <Head>
        <Link rel="canonical" :href="`https://wnyc.org${route.path}`" />
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
    <the-header />
    <main>
      <div class="dots" />
      <div class="content">
        <ListenAllLiveButton />
        <div v-if="isApp" class="px-4">
          <p>fcm token ==</p>
          <input :value="fcmToken" />
          <pre></pre>
          <p>url = {{ nUrl }}</p>
          <p>appLaunchUrl = {{ appLaunchUrl }}</p>
          <p>routeSlugEvent = {{ routeSlugEvent }}</p>
          <p>Notification = {{ nNotification }}</p>
          <p>nActionId = {{ nActionId }}</p>
          <p>nInputValue = {{ nInputValue }}</p>
          <p>nError = {{ nError }}</p>
          <p>notificationList = {{ getNotificationList }}</p>
          <h4>Capacitor's JavaScript API</h4>
          <h6>
            Platform (web | ios | android) = {{ Capacitor.getPlatform() }}
          </h6>
          <h6>isNativePlatform = {{ Capacitor.isNativePlatform() }}</h6>
          <h6>
            isPluginAvailable('Camera') =
            {{ Capacitor.isPluginAvailable('Camera') }}
          </h6>
        </div>
        <slot />
      </div>
    </main>
    <the-footer />
    <audio-player />
  </div>
</template>

<style lang="scss">
.dots {
  opacity: 0.5;
  background-image: radial-gradient(
      RGB(255, 255, 255, 0.6) 2px,
      transparent 2px
    ),
    radial-gradient(RGB(255, 255, 255, 0.6) 2px, transparent 2px);
  background-position: 35px 0, 35px 35px;
  background-size: 35px 35px;
  width: 1366px;
  max-width: 100%;
  height: 340px;
  position: absolute;
  margin: auto;
  right: 0;
  left: 0;
}
.content {
  z-index: 10;
  position: relative;
}
</style>
