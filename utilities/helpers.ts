import { format, formatDistanceToNowStrict } from "date-fns"
import { StatusBar, Style } from "@capacitor/status-bar"
import { Device, type DeviceInfo } from '@capacitor/device'
import { useAuth } from "~/composables/useAuth"
import {
  useCurrentEpisode,
  useCurrentEpisodeHolder,
  useDeviceId,
  useTextSizeOption,
  useIsApp,
  useCurrentUser,
  useCurrentUserProfile,
  useLocalUserProfileDefault,
  useCurrentUserFavorites,
  useTogglePlayTrigger,
  useGlobalToast,
  useAccountPromptSideBar,
  useIsDarkMode,
  useIsNetworkConnected,
  useIsLiveStream,
  useAccountDeleteSideBar,
  useSettingSideBar,
  useIsRefreshing,
} from "~/composables/states"
import { Capacitor } from "@capacitor/core"
import { Preferences } from "@capacitor/preferences"
import { NativeSettings, AndroidSettings } from "capacitor-native-settings"
import { Browser } from "@capacitor/browser"
import {
  cmsSources,
  mediaTypeRoutes,
  localUserProfileKey,
  liveStationPreferences,
} from "~/composables/globals"
import { updateAllLiveStreams } from "~/composables/data/liveStream"
import axios from "axios"
import { Share } from "@capacitor/share"
import { Clipboard } from "@capacitor/clipboard"
import { initDeviceId } from "~/utilities/device-id.js"
import { deleteDirectory } from "~/utilities/file-system"
//import { useSupabaseClient } from '@nuxtjs/supabase'
import {
  AppTrackingTransparency,
} from "capacitor-plugin-app-tracking-transparency"
import {
  type AppTrackingStatusResponse,
} from "capacitor-plugin-app-tracking-transparency"
import { initMediaSession } from "~/utilities/media-session.js"
import useOneSignal from "~/composables/useOneSignal"
import { capacitorIosNotificationSettings } from '@nypublicradio/capacitor-ios-notification-settings'
import { FirebaseAnalytics } from '@capacitor-firebase/analytics'

// helper function that turns any string into a valid element id or slug
export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// handle an internal route or external link
export const getRouteOrLink = (
  url: string,
  routingDomains: string[] = [
    "www.wnyc.org",
    "demo.wnyc.org",
    "www.demo.wnyc.org",
  ]
) => {
  if (!url) return url
  const parsedUrl = new URL(url)
  if (routingDomains.includes(parsedUrl.hostname)) {
    console.log("parsedUrl = ", parsedUrl)
    return parsedUrl.pathname
  }
  return url
}

// function to check if a URL returns a 404
export const checkUrl404 = async (url) => {
  try {
    const response = await axios(url, { method: "HEAD" })
    return response.status === 404
  } catch (error) {
    console.error("Error checking URL:", error)
    return true
  }
}

// return organization name from CMS source
export const getOrg = (cmsSource) => {
  switch (cmsSource) {
    case cmsSources.PUBLISHER:
      return "WNYC"
    case cmsSources.WAGTAIL:
      return "Gothamist"
    case cmsSources.NPR:
      return "NPR"
    case cmsSources.SIMPLECAST:
      return "WNYC"
    default:
      return "WNYC"
  }
}

// returns the time since the episode was published, but checks for updated_date first
export const whenTime = (data) => {
  const res = data?.updatedDate
    ? howLongAgo(data?.updatedDate)
    : data?.publicationDate
      ? howLongAgo(data?.publicationDate)
      : data?.publishAt
        ? howLongAgo(data?.publishAt)
        : howLongAgo(data?.firstPublishedAt)
  return res
}

// format ISO timestamp to return only the time
export function formatTime (date: any, formatString = "h:mm a") {
  if (date) {
    const dateObject = new Date(date)
    return format(dateObject, formatString)
  }
  return null
}

// Function to strip HTML tags and return text content
export function stripHtmlTags (str) {
  return str ? str.replace(/<[^>]*>?/gm, '') : ''
}

// Computed property to calculate reading time
export const getReadingTime = (content: string | number): string => {
  // If content is a number (seconds), convert directly to minutes
  if (typeof content === 'number') {
    return `${content} min read`
  }

  // If content is a string (HTML), calculate based on word count
  const textContent = stripHtmlTags(content)
  const wordsPerMinute = 200 // Average reading speed
  const estimatedWordCount = textContent.split(/\s+/).length
  return `${Math.ceil(estimatedWordCount / wordsPerMinute)} min read`
}

// returns the rounded up minutes duration of the episode
export const getMinutes = (ms, mult = 1000) => {
  const seconds = Math.round(ms / mult)
  let minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  minutes %= 60

  let duration = ""
  if (hours > 0) {
    duration += `${hours} hr`
  }
  if (minutes > 0) {
    duration += ` ${minutes} min`
  }
  if (duration === "") {
    duration = "Play"
  }
  return duration
}

// function that tracks audio events to google analytics
export const trackAudioEvent = (eventName, audioType, audioTitle, audioShow) => {
  const { $analytics } = useNuxtApp()
  const currentUser = useCurrentUser()
  const deviceId = useDeviceId()
  $analytics.sendEvent(eventName, {
    audio_type: audioType,
    audio_title: audioTitle,
    audio_show: audioShow,
    user_id: currentUser.value?.id ?? deviceId.value,
  })
}

// function that tracks click events to google analytics
export const trackClickEvent = (category, component, label) => {
  const { $analytics } = useNuxtApp()
  const currentUser = useCurrentUser()
  const deviceId = useDeviceId()
  $analytics.sendEvent("click_tracking", {
    event_category: category,
    component,
    event_label: label,
    user_id: currentUser.value?.id ?? deviceId.value,
  })
}

/**
 * to get how long ago a date was
 */
export function howLongAgo (date) {
  if (date) {
    // check if unix tiumestamp
    if (Number.isInteger(date)) {
      date = new Date(date * 1000)
    }

    const res = formatDistanceToNowStrict(new Date(date), {
      addSuffix: true,
    })

    return res.replace("minutes", "min").replace("minute", "min")
  }
  return null
}

/**
 * to get the desired date format for the header
 */
export function getDate (data = null, formatString = "EEE, MMM do") {
  const date = data?.updatedDate || data?.publicationDate
  if (date) {
    const currentDate = new Date()
    const inputDate = new Date(date)

    // Check if it's the same day (year, month, and day)
    const isSameDay =
      currentDate.getFullYear() === inputDate.getFullYear() &&
      currentDate.getMonth() === inputDate.getMonth() &&
      currentDate.getDate() === inputDate.getDate()

    if (isSameDay) {
      return whenTime(data)
    }

    // Add year to format string if it's not the current year
    if (currentDate.getFullYear() !== inputDate.getFullYear()) {
      formatString = `${formatString}, yyyy`
    }

    return format(inputDate, formatString)
  } else {
    return format(new Date(), formatString)
  }
}

/**
 * to get the desired date format for the header
 */
export function formatDate (date = null, formatString = "EEE, MMM do") {
  if (date) {
    //const currentYear = new Date().getFullYear()
    const inputDate = new Date(date)
    //const inputYear = inputDate.getFullYear()
    // if (inputYear !== currentYear) {
    //   formatString = `${formatString}, yyyy` // Update formatString to include the year
    // }
    return format(inputDate, formatString)
  } else {
    return format(new Date(), formatString)
  }
}

/**
 * to get the yaer for the footer in the settings
 */
export function getYear () {
  return new Date().getFullYear()
}

/**
 * helper function to capitalize the first letter of a string
 */
export function capitalizeFirstLetter (str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * helper function to change the global font size
 */
export function setFontSize (size: string) {
  document.documentElement.style.fontSize = size
}

/**
 * helper function to toggle darkmode of the status bar
 */
export async function setStatusDarkMode (bool: boolean) {
  await nextTick()
  const isApp = useIsApp()
  if (isApp.value) {
    // delay needed for some reason
    setTimeout(async () => {
      bool
        ? await StatusBar.setStyle({ style: Style.Dark })
        : await StatusBar.setStyle({ style: Style.Light })
    }, 1000)
  }
}
/**
 * helper function to toggle darkmode
 */
export async function setDarkMode (bool: boolean) {
  // TEMP, no dark ode for browser yet
  const isApp = useIsApp()
  const dmBool = isApp.value ? bool : false
  dmBool
    ? document.documentElement.classList.add("style-mode-dark")
    : document.documentElement.classList.remove("style-mode-dark")
  await setStatusDarkMode(dmBool)
  const isDarkMode = useIsDarkMode()
  isDarkMode.value = dmBool
}


// helper function to get the pixel size from thr label
export const getTextSizePixel = (label) => {
  if (typeof label === "string") {
    const textSizeOptions = useTextSizeOption()
    return textSizeOptions.value.find((item) => item.label === label).pixel
  } else {
    return label.pixel
  }
}

// detect system theme preference
export const detectSystemDarkMode = () => {
  // TEMP, no dark mode for browser yet
  if (!useIsApp().value) return false
  return Boolean(
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
  )
}

// set the display settings in one place
export const setDisplaySettings = async (data) => {
  setFontSize(getTextSizePixel(data.text_size))
  await setDarkMode(data.dark_mode)
}

// generate a random number between min and max
export const getRandomNumber = (min, max) => {
  return Math.random() * (max - min) + min
}

// will take the user to their native os system settings
export const toSystemSettings = () => {
  if (Capacitor.getPlatform() === "android") {
    NativeSettings.openAndroid({
      option: AndroidSettings.AppNotification,
    })
  } else {
    // for iOS, we are using a custom plugin
    capacitorIosNotificationSettings.openNotificationSettings()
  }
}

// get device information
export async function getFullDeviceInfo (): Promise<DeviceInfo | null> {
  try {
    const info = await Device.getInfo()
    return info
  } catch (error) {
    console.error('Error getting full device info:', error)
    return null
  }
}

//determine where to send the user to get the app based on their platform or if on browser
export const getAppDownloadLink = async () => {
  const androidStoreUrl = "https://play.google.com/store/apps/details?id=org.wnyc.android"
  const iosStoreUrl = "https://apps.apple.com/us/app/wnyc/id470219771"

  const info = await getFullDeviceInfo()

  if (info?.platform === "android") {
    return androidStoreUrl
  } else if (info?.platform === "ios") {
    return iosStoreUrl
  } else if (info?.operatingSystem === 'ios') {
    return iosStoreUrl
  } else if (info?.operatingSystem === 'android') {
    return androidStoreUrl
  } else {
    // For web browsers, redirect to the mobile route
    return "/mobile"
  }
}

// helper function to open a link in the browser IN the app
export async function openLinkInAppBrowser (url: string) {
  await Browser.open({ url })
}


// global function for copying to clipboard
export const copyToClipBoard = async (content: string) => {
  const globalToast = useGlobalToast()
  try {
    if (Capacitor.getPlatform() === "ios" || Capacitor.getPlatform() === "android") {
      // Use Capacitor Clipboard for mobile apps
      await Clipboard.write({
        string: content,
      })
    } else {
      // Use native browser Clipboard API for web
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content)
      } else {
        // Fallback for older browsers or insecure contexts
        const textArea = document.createElement('textarea')
        textArea.value = content
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
    }
    globalToast.value = {
      severity: "info",
      summary: "Copied to clipboard",
      life: 3000,
    }
  } catch (err) {
    console.error("Failed to copy text: ", err)
    globalToast.value = {
      severity: "error",
      summary: "Failed to copy to the clipboard",
      life: 3000,
    }
  }
}

// share API
export const shareAPI = async (
  content,
  componentOfOrigin = "Component of origin not specified"
) => {
  const shareData = {
    title: stripHtmlTags(content.socialTitle || content.title),
    text: stripHtmlTags(content.rawBody || content.description || content.title),
    url: content.url || content.titleLink,
  }

  trackClickEvent("Click Tracking - Share", componentOfOrigin, shareData.title)
  // Native Mobile Sharing
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
      dialogTitle: "Share with buddies",
    })
    return // Exit after native share
  }

  // Web Share API
  if (navigator.share && shareData.url) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
      })
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled the share. No action needed.
      } else {
        // Any other error, we fallback to clipboard
        console.error("Web Share API error:", error)
        copyToClipBoard(shareData.url)
      }
    }
  } else {
    // Fallback for browsers without Web Share API or if URL is missing
    if (shareData.url) {
      copyToClipBoard(shareData.url)
    } else {
      console.error("No URL provided to share or copy.")
    }
  }
}

// handle the delete of the stored audio file and GA tracking
export const handleDelete = (file) => {
  const globalToast = useGlobalToast()
  deleteDirectory(file)
  globalToast.value = {
    severity: "info",
    summary: "Removed download.",
    life: 3000,
  }
  // GA tracking
  trackClickEvent(
    "Click Tracking - Audio file delete",
    "Episode Item",
    `deleting = ${file.directoryAudio.name}`
  )
}

// get the current user's favorited items
export const getFavoritedItems = async () => {
  const favorites = useCurrentUserFavorites()
  const user = useCurrentUser()
  if (user.value) {
    const client = useSupabaseClient()
    const { data, error } = await client
      .from("favorited")
      .select("*")
      .eq("uid", user.value.id)

    if (error) {
      console.error("favorited items error", error)
    }
    favorites.value = data
  }
}

// check if an item is favorited
export const checkIsFavorited = (slug: string) => {
  const user = useCurrentUser()
  if (user.value) {
    const favorites = useCurrentUserFavorites()
    if (favorites.value) {
      const result = favorites.value.find(
        (item) => item.slug === slug || item.media_id === slug
      )
      return result ? true : false
    }
  }
  return false
}

// time converter
export const convertTime = (val) => {
  const hhmmss = new Date(val * 1000).toISOString().substring(11, 19)
  return hhmmss.startsWith("00:") ? hhmmss.substring(3) : hhmmss
}

// get and set the user profile
export const getAndSetUserProfile = async () => {
  const isNetworkConnected = useIsNetworkConnected()
  const isApp = useIsApp()
  const currentUser = useCurrentUser()
  const currentUserProfile = useCurrentUserProfile()
  const localUserProfileDefault = useLocalUserProfileDefault()
  const config = useRuntimeConfig()
  const client = useSupabaseClient()
  const user = await client.auth.getSession()
  const { toggleOneSignalUserTag, OneSignalLogin, getMasterNotificationChannels, syncMasterNotificationChannels } = useOneSignal()
  const masterNotificationChannelsArray = await getMasterNotificationChannels()
  // function that gets a user profile
  const getProfile = async () => {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", currentUser.value.id)
      .single()
    if (error) {
      console.error(error)
      //account does not exist anymore, wipe local storage and session and hard refresh
      if (error.code === 'PGRST116') {
        await Preferences.clear()
        await localStorage.clear()
        location.reload()
      }
    } else if (data) {
      const lsSTRING = await Preferences.get({ key: localUserProfileKey })
      const ls = JSON.parse(lsSTRING.value)

      //what the user has already selected in the local storage OR the default
      const defaultNotificationChannels = ls?.one_signal_notification_channels || masterNotificationChannelsArray

      if (data.initial) {
        // FIRST INITIAL LOGIN EVER

        // some odd timing hack to fix the text_size and default station if they come over as an object
        if (typeof ls.text_size === 'object') {
          ls.text_size = ls.text_size.label
        }
        if (typeof ls.default_live_stream === 'object') {
          ls.default_live_stream = ls.default_live_stream.station
        }

        // get the system's notification permission and apply it to the ls
        ls.receive_general_notifications = await useOneSignal().checkPermissions()


        // if first time logging in with new profile, set preferences from the local storage
        data.initial = false
        data.autodownload = ls.autodownload
        data.default_live_stream = ls.default_live_stream
        data.receive_general_notifications = ls.receive_general_notifications
        data.one_signal_notification_channels = defaultNotificationChannels
        data.dark_mode = ls.dark_mode
        data.text_size = ls.text_size

        // update supabase profile data
        // set the supabase preferences with what is currently set in the local storage
        await client
          .from("profiles")
          .update({
            initial: data.initial,
            autodownload: data.autodownload,
            default_live_stream: data.default_live_stream,
            receive_general_notifications: data.receive_general_notifications,
            one_signal_notification_channels: data.one_signal_notification_channels,
            dark_mode: data.dark_mode,
            text_size: data.text_size,
          })
          .match({ id: currentUser.value.id })

        // set the current user profile state
        currentUserProfile.value = data
        // One Signal login
        await OneSignalLogin()

        // initially add the user tags to OneSignal profile
        masterNotificationChannelsArray.forEach((channel: { key: string }) => {
          toggleOneSignalUserTag(channel.key, true)
        })

        updateAllLiveStreams()
        setDisplaySettings(data)

      } else {

        // NOT FIRST LOGIN EVER

        // set the current user profile state
        currentUserProfile.value = data

        // One Signal login
        await OneSignalLogin()

        // FIRST TIME POPULATING THE NOTIFICATION CHANNELS ON EXISTING PROFILES
        // if data.one_signal_notification_channels is not set (defaults as NULL), set it to the defaultNotificationChannels
        if (!data.one_signal_notification_channels || data.one_signal_notification_channels.length === 0) {

          // update data object with the defaultNotificationChannels
          data.one_signal_notification_channels = defaultNotificationChannels

          // get the system's notification permission and apply it to the data.receive_general_notifications
          data.receive_general_notifications = await useOneSignal().checkPermissions()

          // update supabase profile data with the updated data.one_signal_notification_channels
          await client
            .from("profiles")
            .update({
              one_signal_notification_channels: data.one_signal_notification_channels,
              receive_general_notifications: data.receive_general_notifications,
            })
            .match({ id: currentUser.value.id })

          // initially add the user tags to OneSignal profile
          masterNotificationChannelsArray.forEach((channel: { key: string }) => {
            toggleOneSignalUserTag(channel.key, true)
          })

          // set the current user profile state again after updating the channels
          //currentUserProfile.value = data
          Object.assign(currentUserProfile.value, data)

        } else {

          // CHANNELS ALREADY SET

          // check if supabase master notification channels changed and sync them with supabase and OneSignal
          data.one_signal_notification_channels = await syncMasterNotificationChannels(data, masterNotificationChannelsArray)

          // get the system's notification permission and apply it to the data.receive_general_notifications
          data.receive_general_notifications = await useOneSignal().checkPermissions()

          // update supabase profile data with the updated data.one_signal_notification_channels
          await client
            .from("profiles")
            .update({
              one_signal_notification_channels: data.one_signal_notification_channels,
              receive_general_notifications: data.receive_general_notifications,
            })
            .match({ id: currentUser.value.id })

          // set the current user profile state again after the sync
          //currentUserProfile.value = data
          Object.assign(currentUserProfile.value, data)

        }

        // update streams and settings
        updateAllLiveStreams()
        setDisplaySettings(currentUserProfile.value)
      }
    }
  }

  // check local storage for the auth token
  if (import.meta.client) {
    const supabaseAuthToken = await Preferences.get({
      key: config.public.supabaseAuthTokenName,
    })
    if (supabaseAuthToken.value) {
      currentUser.value = supabaseAuthToken.user
    }
    // check supabase session for logged in user
    if (user?.data?.session?.user) {
      currentUser.value = user?.data?.session?.user
    }

    // update the google account image if logged in provider is google
    if (user.data.session?.user.app_metadata.provider === 'google') {
      await client
        .from('profiles')
        .update({
          updated_at: new Date().toISOString(),
          name: user.data.session.user.user_metadata.full_name,
          avatar_image_url: user.data.session.user.user_metadata.avatar_url,
        })
        .match({ id: user.data.session.user.id })
    }

    // if no network connection, get the user profile from local storage
    if (!isNetworkConnected.value) {
      const lsSTRING = await Preferences.get({ key: localUserProfileKey })
      const ls = JSON.parse(lsSTRING.value)
      currentUserProfile.value = ls

      setDisplaySettings(currentUserProfile.value)
    } else {


      if (!currentUser.value) {
        // initially set default user profile settings or use the local storage settings

        // does local storage settings exist?
        const isLocalUserProfile = await Preferences.get({ key: localUserProfileKey })
        if (!isLocalUserProfile.value) {
          // no, set defaults from localUserProfileDefault state
          const defaults = localUserProfileDefault.value

          //get the system's current theme and apply it to the initial defaults
          defaults.dark_mode = detectSystemDarkMode()

          // get the system's notification permission and apply it to the initial defaults
          defaults.receive_general_notifications = await useOneSignal().checkPermissions()


          const defaultsSTRING = JSON.stringify(defaults)
          await Preferences.set({
            key: localUserProfileKey,
            value: defaultsSTRING,
          })

          currentUserProfile.value = defaults

          updateAllLiveStreams()
          //set display settings
          setDisplaySettings(defaults)
        } else {

          const localUserProfile = JSON.parse(isLocalUserProfile.value)

          // check if supabase master notification channels changed and sync them with the local storage and supabase and OneSignal
          localUserProfile.one_signal_notification_channels = await syncMasterNotificationChannels(localUserProfile, masterNotificationChannelsArray)

          // set local storage with the updated data.one_signal_notification_channels
          const localUserProfileSTRING = JSON.stringify(localUserProfile)
          await Preferences.set({
            key: localUserProfileKey,
            value: localUserProfileSTRING,
          })

          // local storage is set, so set currentUserProfile to the local storage settings
          currentUserProfile.value = localUserProfile

          // get the system's notification permission and apply it to the currentUserProfile.value
          currentUserProfile.value.receive_general_notifications = await useOneSignal().checkPermissions()


          updateAllLiveStreams()
          //set display settings
          setDisplaySettings(currentUserProfile.value)
        }
      } else {
        // if they are a user, get their profile data
        await getProfile()

        //init Firebase Analytics
        await FirebaseAnalytics.setUserId({
          userId: currentUser.value.id,
        })

        // get the device id if it's an app and not a browser
        if (isApp.value) {
          await initDeviceId()
        }
        await getFavoritedItems()
      }
    }
  }
}
interface SavedItem {
  uid: string
  type: string
  cmsSource: string
  media_id: string
  slug: string
  url: string
  reading_time: string
  estimatedDuration: number
  title: string
  image: any
  producingOrganizations: any
  authors: any
  meta: any
  audio: any
  showTitle: string
}

// const isDifferentMedia = (media: object, type: string) => {
//   const currentEpisodeHolder = useCurrentEpisodeHolder()
//   switch (type) {
//     case "live":
//       return currentEpisodeHolder.value?.slug !== media?.slug

//     default:
//       return currentEpisodeHolder.value?.id !== media?.id
//   }
// }

export const deleteFavorite = async (media: object, tableArg = "favorited") => {
  // detect if logged in
  const user = useCurrentUser()
  if (user.value) {
    // format the media object to save
    const uid = user.value?.id
    const slug = media?.slug ?? media?.meta.slug
    //const media_id = media.media_id ?? media?.id
    //save instance to Supabase
    const client = useSupabaseClient()
    const { error } = await client
      .from(tableArg)
      .delete()
      .eq("uid", uid)
      .or(`slug.eq.${slug}`)

    if (error) {
      console.error("error deleting favorite", error)
    }
  }
}

// handles saving a favorite or recently played item
// if a duplicate existingRecord is found, it removes the original and adds the new one
export const saveFavorite = async (
  media: object,
  typeArg: string,
  tableArg = "favorited"
) => {
  const user = useCurrentUser()
  if (user.value) {
    const client = useSupabaseClient()
    // check if record exists
    const thisSlug = media?.meta?.slug ?? media?.slug ?? media?.id
    const { data: existingRecord, error: existingError } = await client
      .from(tableArg)
      .select("*")
      .eq("uid", user.value.id)
      .eq("slug", thisSlug)
    if (existingError) throw existingError
    if (existingRecord && existingRecord.length > 0) {
      await deleteFavorite(existingRecord[0], tableArg)
    }
    const source = media?.cmsSource
    // format the media object to save
    // the fallbacks take into account if the user is selecting  an item that was fed by the CMS or Supabase
    const uid = user.value?.id
    const cmsSource = source
    const media_id = media?.media_id ?? media?.id
    const slug = thisSlug
    const url = media?.url ?? media?.link
    const type = typeArg
    const reading_time = media?.reading_time ?? getReadingTime(media?.rawBody)
    const estimatedDuration = media?.estimatedDuration
    const image = media?.image
    const title = media?.title
    const producingOrganizations = media?.producingOrganizations
    const authors = media?.authors
    const meta = media?.meta
    const audio = media?.audio ?? media?.hls
    const showTitle = media?.showTitle ?? media?.headers?.brand?.title ?? media?.station
    const itemToSave: SavedItem = {
      uid,
      type,
      cmsSource,
      media_id,
      slug,
      url,
      reading_time,
      estimatedDuration,
      image,
      title,
      authors,
      producingOrganizations,
      meta,
      audio,
      showTitle,
    }
    //save instance to Supabase
    const { error } = await client.from(tableArg).insert([itemToSave])
    if (error) {
      console.error("error = ", error)
    }
  }
}

// handle saving the last played to the history of the user. data is saved in supabase table called recently_viewed
export const saveRecentlyPlayed = (media: object, typeArg = media.type) => {
  saveFavorite(media, typeArg, "recently_viewed")
}

// normalize the bucket item data for the player
export const prepForPlayer = (item) => {
  const fileValue = item.file?.includes("blob:")
    ? item.file : item.audio || item.hls

  const theImage = item.headers?.brand?.logoImage ??
    item.headers?.brand?.logoImage ??
    item.showImage ??
    item.image ??
    item.listingImage

  return {
    ...item,
    file: fileValue,
    audio: fileValue,
    hls: item.hls,
    title: item.title,
    player_image: theImage,
    duration: item.estimatedDuration || item.duration,
    details: item.body,
    first_published_at: item.publishAt,
  }
}

// handles playing episodes and segments
export const togglePlayEpisode = (media, type = mediaTypes.EPISODE) => {
  const currentEpisode = useCurrentEpisode()
  const togglePlayTrigger = useTogglePlayTrigger()
  const isLiveStream = useIsLiveStream()
  type === mediaTypes.LIVE ? isLiveStream.value = true : isLiveStream.value = false

  if (currentEpisode.value?.id !== media.id) {
    currentEpisode.value = prepForPlayer(media)
    saveRecentlyPlayed(media, type)
  }

  togglePlayTrigger.value = !togglePlayTrigger.value
}

// css var helper to get the css var value or as pixel value
export const getCssVar = (name: string, px = false) => {
  const val = getComputedStyle(document.documentElement).getPropertyValue(name)

  return px ? val : Number(parseInt(val))
}
// ROUTING
/* centralized function to route to a episode page */
export const goToEpisodePage = (ep, params, log = true) => {
  const cmsSource = ep.cmsSource || cmsSources.PUBLISHER

  // For Simplecast episodes, use UUID in URL path since Simplecast API requires UUIDs
  // For other sources, use slug
  const identifier = (cmsSource === cmsSources.SIMPLECAST && ep.uuid)
    ? ep.uuid
    : (ep.meta?.slug ?? ep.slug)

  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.EPISODE]}${cmsSource}/${identifier}`,
    query: params,
  })

  if (log) {
    saveRecentlyPlayed(ep)
  }
}

/* centralized function to route to a live page */
export const goToLivePage = (ep, params, log = true) => {
  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.LIVE]}`,
    query: params,
  })
  if (log) {
    saveRecentlyPlayed(ep)
  }
}

/* centralized function to route to a story page */
export const goToStoryPage = (story, params, log = true) => {
  const theLink = story.url || story.link
  if (Capacitor.getPlatform() === "web" && theLink && story.cmsSource === cmsSources.WAGTAIL) {
    // open in new tab if web and wagtail source (Gothamist)
    window.open(theLink, "_blank")
  } else {
    navigateTo({
      path: `${mediaTypeRoutes[mediaTypes.STORY]}${story.media_id ?? story.id}`,
      query: params,
    })
  }
  if (log) {
    saveRecentlyPlayed(story)
  }
}

/* centralized function to route to a story page */
export const goToNprPage = (story, log = true) => {
  // const theLink = story.url || story.link
  // if (Capacitor.getPlatform() === "web" && theLink) {
  //   // open in new tab to NPR.org if web
  //   window.open(theLink, "_blank")
  // } else {
  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.NPR_EPISODE]}${story.media_id ?? story.id}`,
  })
  //}
  if (log) {
    saveRecentlyPlayed(story)
  }
}

/* centralized function to route to a event page */
export const goToEventPage = (story, log = true) => {

  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.EVENT]}${story.meta?.slug ?? story.slug ?? story.id}`,
  })
  //}
  if (log) {
    saveRecentlyPlayed(story)
  }
}
/* centralized function to route to a show page */
export const goToShowPage = (show, params = null) => {
  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.SHOW]}${show.meta?.slug ?? show.slug}`,
    query: params,
  })
}
/* centralized function to route to a card page */
export const goToCardPage = (item, params = null) => {
  const path = `${mediaTypeRoutes[mediaTypes.CARD]}${getRouteOrLink(item.url)}`
  // if the path is a full url, open in new tab
  if (path.startsWith("http")) {
    window.open(path, "_blank")
    return
  } else {
    navigateTo({
      path,
      query: params,
    })
  }
}

// return bool if the url has a query param
export const hasQueryParams = (url) => {
  const parsedUrl = new URL(url)
  return parsedUrl.searchParams.toString().length > 0
}

// checks if the audio key has a valid value for having audio
export const hasAudio = (audio) => {
  return (
    audio &&
    ((typeof audio === "string" && audio.trim() !== "") ||
      (Array.isArray(audio) &&
        audio.length > 0 &&
        audio.every((item) => item && typeof item === "string" && item.trim() !== "")))
  )
}

// Function to get the raw body from a wagtail body array
export const getWagtailRawBody = (bodyArr) => {
  if (!Array.isArray(bodyArr)) {
    return bodyArr
  }

  return bodyArr
    .filter((item) => item.type === "paragraph")
    .map((item) => item.value.replace(/<\/?[^>]+(>|$)/g, "")) // Strip HTML tags
    .join(" ")
}

// Define the interface for the function parameters
interface AddToFavoritesParams {
  item: any // Replace 'any' with the actual type of bucketItem
  isFavorited: boolean
  message?: string
  callback?: () => void
}
// function to add to the favorites
export const addToFavorites2 = async ({ item, isFavorited, message = isFavorited ? "Removed from Favorites." : "Added to Favorites.", callback }: AddToFavoritesParams) => {
  const user = useCurrentUser()
  const accountPromptSideBar = useAccountPromptSideBar()
  if (user.value) {
    const globalToast = useGlobalToast()
    const episode = {
      ...item,
      slug: item.meta?.slug ?? item.slug,
      estimatedDuration: item.estimatedDuration || item.duration,
    }
    if (isFavorited) {
      await deleteFavorite(episode)
      getFavoritedItems()
      if (callback) {
        callback()
      }
    } else {
      await saveFavorite(episode, episode.type)
      getFavoritedItems()
      if (callback) {
        callback()
      }
    }
    globalToast.value = {
      severity: "info",
      summary: message,
      life: 3000,
    }
    trackClickEvent(
      `Click Tracking - ${message}`,
      "Episode Item",
      item.title
    )
  } else {
    accountPromptSideBar.value = true
  }
}

// handles how to use the correct navigate method based on the item type
export const dynamicNavigation = (item, isSaveHistory = true, isDownloaded = false) => {
  const isNetworkConnected = useIsNetworkConnected()
  if (isNetworkConnected.value) {
    switch (item.type || item.contentType) {
      case mediaTypes.LIVE:
        goToLivePage(item, { slug: item.slug, type: item.type }, isSaveHistory)
        break
      case mediaTypes.EPISODE:
      case mediaTypes.SEGMENT:
        goToEpisodePage(item, null, isSaveHistory)
        break
      case mediaTypes.STORY:
      case mediaTypes.ARTICLE:
      case mediaTypes.ARTICLE_PAGE:
        item.audio
          ? goToEpisodePage(item, null, isSaveHistory)
          : goToStoryPage(item, { src: item.cmsSource, downloaded: isDownloaded, id: item.id, }, isSaveHistory)
        break
      case mediaTypes.SHOW:
        goToShowPage(item)
        break
      case mediaTypes.NPR_EPISODE:
      case mediaTypes.NPR_ARTICLE:
        goToNprPage(item)
        break
      case mediaTypes.EVENT:
        goToEventPage(item)
        break
      case mediaTypes.CARD:
        goToCardPage(item)
        break
      default:
        goToEpisodePage(item, null, isSaveHistory)
    }
  } else {
    const globalToast = useGlobalToast()
    globalToast.value = {
      severity: "error",
      summary: "Not connected. Try again later.",
      life: 3000,
      closable: true,
    }
  }
}

// handles the permissions for push & local notifications
export const askNotificationPermissions = () => {
  const oneSignal = useOneSignal()
  oneSignal.requestNotificationPermission()
}

// handles iOS asking permission for tracking
export const askTrackingPermissions = async () => {
  if (Capacitor.getPlatform() === "ios") {
    await AppTrackingTransparency.requestPermission().then(
      (response: AppTrackingStatusResponse) => {
        // we are currently not doing anything with the response
        if (response.status === "authorized") {
          // User has authorized
          // eventualy add this preference to the users profile
          // attach it to a toggle switch in the settings that triggerss the request again
        }
      }
    )
    // AppTrackingTransparency.getStatus().then((response: AppTrackingStatusResponse) => {
    //   console.log("getStatus response: ", response)
    //   if (response.status === "authorized") {
    //     // User has authorized
    //   }
    // })
  }
}

// handles the toggling of permissions for push & local notifications. Either to use the available prompt, or route to the system settings to manually change it
export const toggleAskNotificationPermissions = async () => {
  await useOneSignal().checkPermissions() ? toSystemSettings() : askNotificationPermissions()
}

// log out the current user
export const logOutUser = async () => {
  const client = useSupabaseClient()
  const currentUser = useCurrentUser()
  const currentEpisode = useCurrentEpisode()
  const currentEpisodeHolder = useCurrentEpisodeHolder()
  const isEpisodePlaying = useIsEpisodePlaying()
  const { logout } = useAuth()

  // sign out from supabase
  await client.auth.signOut()

  // clear JWT authentication state
  logout()

  // set the currentUser composable to null
  currentUser.value = null

  // clear what is playing
  currentEpisode.value = null
  currentEpisodeHolder.value = null
  isEpisodePlaying.value = false

  // clear the local storage
  await Preferences.clear()

  // logout of OneSignal
  useOneSignal().logout()

  getAndSetUserProfile()
}

// handle account deletion requests
export const requestAccountDeletion = async () => {
  const currentUserProfile = useCurrentUserProfile()
  const accountDeleteSideBar = useAccountDeleteSideBar()
  const settingsSideBar = useSettingSideBar()
  const globalToast = useGlobalToast()

  // post to zapier webhook
  if (currentUserProfile.value?.id) {
    await $fetch('https://hooks.zapier.com/hooks/catch/1135793/23fbxa5/', {
      method: 'POST',
      body: { "email": currentUserProfile.value?.email, "id": currentUserProfile.value?.id }
    })
  }

  logOutUser()

  // close the account delete and settings sidebars
  accountDeleteSideBar.value = false
  settingsSideBar.value = false

  // send user to the sign in page
  await navigateTo('/home')

  // show toast confirmation of deletion request
  globalToast.value = {
    severity: "info",
    summary: 'We have received your request to delete your account. Please allow 7-10 business days for your request to be processed.',
    closable: true,
  }
}
// Custom sorting function that ignores "A " and "The " at the beginning of titles
export const customAlphabeticalSort = (key = 'title') => {
  return (a, b) => {
    // get the value from the key
    const getValue = (obj, key) => obj[key]

    // get the title without "A " or "The " at the beginning
    const getTitle = (title) => {
      const prefixes = ["A ", "The "]
      for (const prefix of prefixes) {
        if (title.startsWith(prefix)) {
          return title.substring(prefix.length)
        }
      }
      return title
    }

    const aValue = getTitle(getValue(a, key))
    const bValue = getTitle(getValue(b, key))

    if (aValue !== bValue) {
      return aValue.localeCompare(bValue)
    }

    return a.localeCompare(b)
  }
}

// function that converts and array to a set to remove the dups
export const deduplicateArray = (array) => {
  return [...new Set(array)]
}

// a func to refresh all data
export const refreshData = async (refreshUser = false) => {
  const isNetworkConnected = useIsNetworkConnected()
  if (!isNetworkConnected.value) {
    return
  }
  const currentEpisode = useCurrentEpisode()
  const currentEpisodeHolder = useCurrentEpisodeHolder()
  const isRefreshing = useIsRefreshing()
  const isLiveStream = useIsLiveStream()

  isRefreshing.value = true

  if (refreshUser) {
    await getAndSetUserProfile()
  }
  // refresh streams data to display on liveFeature and live page, but set it to the current stream, not the user default
  await updateAllLiveStreams(false)
  try {

    // refresh all nuxt data
    await refreshNuxtData()

  } catch (error) {
    console.error(error)
  } finally {
    setTimeout(() => {
      isRefreshing.value = false
    }, 1000)
  }
  // update the schedule data
  // watch on the live.vue handles this schedule data

  // update currentEpisode LIVE STREAM data and prep for player and media session IF it is or has been played and the expanded player and media session are open 
  if (currentEpisode.value && isLiveStream.value) {
    currentEpisode.value = prepForPlayer(currentEpisodeHolder.value)
    //update media session
    initMediaSession(currentEpisode.value)
  }
}

// function that gets a URL and returns the path and query only
export function getPathAndQuery (urlString) {
  try {
    const url = new URL(urlString)
    return `${url.pathname}${url.search}`
  } catch (error) {
    console.error("Invalid URL:", error)
    return null
  }
}

// the CMS does not have the correct station names for WNYC and WQXR, so we need to customize them here
export const getCustomStationLabel = (station: string): string => {
  const stationPreference = liveStationPreferences.find(pref => pref.station === station)
  return stationPreference?.label ?? station
}

// formats the station list for the dropdown
export const initializeStationList = (stations) => {
  if (!stations) return []

  const tempMenuData = []

  // the CMS does not have the correct station names for WNYC and WQXR, so we need to customize them here
  const getCustomStationLabelFromSlug = (station) => {
    const stationPreference = liveStationPreferences.find(pref => pref.slug === station.slug)
    return stationPreference?.label ?? station.station
  }

  stations.forEach((station) => {
    const customStation = getCustomStationLabelFromSlug(station)
    const formattedStartTime = station.timeStart ? formatTime(station.timeStart, 'h:mm a') : ''
    const formattedEndTime = station.timeEnd ? formatTime(station.timeEnd, 'h:mm a') : ''
    tempMenuData.push({
      id: station.station,  // what gets saved to Supabase
      label: customStation,
      name: station.title,
      station: station.station,
      code: station.title,
      title: station.title,
      slug: station.slug,
      image: station.stationImage || station.image,
      times: formattedStartTime && formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : '',
    })
  })
  return tempMenuData
}

