import { format, formatDistanceToNowStrict } from "date-fns"
import { StatusBar, Style } from "@capacitor/status-bar"
import { Device, type DeviceInfo } from '@capacitor/device';
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
  FALLBACKIMAGEEP,
  FALLBACKIMAGEEPHEAD,
  FALLBACKIMAGEEPDARK,
  FALLBACKIMAGEEPHEADDARK,
  FALLBACKUSER,
  FALLBACKUSERDARK,
  NPRIMAGEDOMAINSOURCES,
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
import { capacitorIosNotificationSettings } from '@nypublicradio/capacitor-ios-notification-settings';
import { FirebaseAnalytics } from '@capacitor-firebase/analytics'
import { is } from "date-fns/locale"

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
export function formatTime(date: any, formatString = "h:mm a") {
  if (date) {
    const dateObject = new Date(date)
    return format(dateObject, formatString)
  }
  return null
}

/*
formats the url of a publisher image so it works with our design system image components
*/
export const formatPublisherImageUrl = (url) => {
  return url.replace("%s/%s/%s/%s", "%width%/%height%/c/%quality%")
}

/*
finds the image first then formats the url of a publisher image so it works with our design system image components
*/
export const formatPublisherImage = (attributes) => {
  const img = attributes.imageMain ?? attributes.image
  const url = img.template
  return url.replace("%s/%s/%s/%s", "%width%/%height%/c/%quality%")
}

// Function to strip HTML tags and return text content
function stripHtmlTags(str) {
  const parser = new DOMParser()
  const dom = parser.parseFromString(str, "text/html")
  return dom.body.textContent ?? ""
}

// Computed property to calculate reading time
export const getReadingTime = (htmlContent) => {
  const textContent = stripHtmlTags(htmlContent)
  const wordsPerMinute = 200 // Average reading speed
  const estimatedWordCount = textContent.split(/\s+/).length
  return `${Math.ceil(estimatedWordCount / wordsPerMinute)} min read`
}

interface ImageAttributes {
  imageMain?: {
    template: string
  }
  image?: {
    template: string
  }
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

// returns a resized image url when provided the entire image object
export const resizePublisherImage = (
  attributes: ImageAttributes,
  w: number,
  h: number,
  q = 80
): string => {
  const img = attributes.imageMain ?? attributes.image
  const url = img.template

  const pieces = url.split("/")
  const finalUrlArr: string[] = []

  pieces.forEach((piece: string, index: number) => {
    if (index < 4 || index > 7) {
      finalUrlArr.push(piece)
    }
    if (index === 4) {
      finalUrlArr.push(`${w}/${h}/c/${q}`)
    }
  })
  return finalUrlArr.join("/")
}

// returns a resized image url when provided just the image URL
export const resizePublisherImageUrl = (
  url: string,
  w: number,
  h: number,
  q = 80
): string => {
  const pieces = url.split("/")
  const finalUrlArr: string[] = []

  pieces.forEach((piece: string, index: number) => {
    if (index < 4 || index > 7) {
      finalUrlArr.push(piece)
    }
    if (index === 4) {
      finalUrlArr.push(`${w}/${h}/c/${q}`)
    }
  })
  return finalUrlArr.join("/")
}

// returns a resized image url when provided just the image URL
export const resizeNprImageUrl = (
  url: string,
  w: number,
  q = 80,
  format = "jpeg"
): string => {
  const finalUrl = url.replace('{width}', w.toString()).replace('{format}', format).replace('{quality}', q.toString())
  return finalUrl
}

// returns a resized image url when provided just the image URL
export const resizeWagtailImageUrl = (
  id: string,
  w: number,
  h: number,
  q = 80,
  format = "jpeg"
): string => {
  const config = useRuntimeConfig()
  const finalUrl = `${config.public.IMAGE_BASE_URL}${id}/fill-${w}x${h}-c0|format-${format}|${format}quality-${q}`
  return finalUrl
}

// central spot to handle image formatting from diff sources
export const imageSolver = (url: string, options: { w?: number, h?: number, q?: number, format?: string } = {}) => {
  // Default values for width, height, quality, and format
  const { w = 288, h = 288, q = 80, format = "jpeg" } = options

  let imgUrl = ""
  if (typeof url === "string" && /^\d+$/.test(url)) {
    imgUrl = resizeWagtailImageUrl(url, w, h, q, format)
  } else if (typeof url === "string" && url.includes("media.wnyc.org")) {
    imgUrl = resizePublisherImageUrl(url, w, h, q)
  } else if (
    typeof url === "string" &&
    Array.isArray(NPRIMAGEDOMAINSOURCES) &&
    NPRIMAGEDOMAINSOURCES.some(domain => url.includes(domain))
  ) {
    imgUrl = resizeNprImageUrl(url, w, q, format)
  } else {
    imgUrl = url
  }
  return imgUrl
}

// returns a templated NPR image url when provided just the image URL
export const templatizeNPRImageUrl = (url: string): string => {
  return url.replace('{width}', '%s').replace('{height}', '%s').replace('{quality}', '%s').replace('{format}', '%s')

}
// returns a templated Wagtail image url when provided just the image URL
export const templatizeWagtailImageUrl = (url: string): string => {

  // formatted :https://cms.prod.nypr.digital/images/352462/fill-592x395-c0|format-webp|webpquality-80

  return url.replace(/fill-(\d+)x(\d+)-c0/, 'fill-%s/%s/c0').replace(/format-[a-zA-Z]+/, 'format-%s').replace(/(webp|jpeg|jpg|png)quality-(\d+)/, '%squality-%s')

}
// returns a templated PUBLISHER image url when provided just the image URL
export const templatizePublisherImageUrl = (url: string): string => {
  const pieces = url.split("/")
  const finalUrlArr: string[] = []

  pieces.forEach((piece: string, index: number) => {
    if (index < 4 || index > 7) {
      finalUrlArr.push(piece)
    }
    if (index === 4) {
      finalUrlArr.push("%s/%s/%s/%s")
    }
  })
  return finalUrlArr.join("/")
}

const isWagtailImage = (srcImg) => {
  return (typeof srcImg === "object" && srcImg?.fileHash) || /^\d+$/.test(srcImg)
}

const isPublisherImage = (srcImg) => {
  return (typeof srcImg === "object" && srcImg?.template?.includes("media.wnyc.org"))
}

const isNPRImage = (srcImg) => {
  return NPRIMAGEDOMAINSOURCES.some((domain) => (typeof srcImg === "object" && srcImg?.template?.includes(domain)) || (typeof srcImg === "string" && srcImg?.includes(domain)))
}
const isWagtailImageUrl = (url) => {
  return (typeof url === "string" && url.includes("nypr.digital/images"))
}

const isPublisherImageUrl = (url) => {
  return (typeof url === "string" && url.includes("media.wnyc.org"))
}

const isNPRImageUrl = (url) => {
  return NPRIMAGEDOMAINSOURCES.some((domain) => ((typeof url === "string" && url?.includes(domain))))
}

export const templatizeImageUrl = (url) => {
  // determine where the image src is from and return the templatized url
  if (isWagtailImageUrl(url)) {
    return templatizeWagtailImageUrl(url)
  } else if (isPublisherImageUrl(url)) {
    return templatizePublisherImageUrl(url)
  } else if (isNPRImageUrl(url)) {
    return templatizeNPRImageUrl(url)
  } else {
    return url
  }
}

const NPRIMAGEDOMAINSOURCES = ["media.npr.org", "npr.brightspotcdn.com"]
// determines the CMS source of an image and returns the cmsSource and image template or id
export const getCmsSourceAndImageTemplate = (srcImg, fallback) => {
  const fallBackObject = { cmsSource: cmsSources.WAGTAIL, imageTemplate: fallback }
  if (srcImg) {
    // check if fileHash exists, or if we pass in a fallback, they are provided as just strings numbers from Wagtail
    if (isWagtailImage(srcImg)) {
      return { cmsSource: cmsSources.WAGTAIL, imageTemplate: srcImg?.id || String(srcImg) }
    } else if (isPublisherImage(srcImg)) {
      return { cmsSource: cmsSources.PUBLISHER, imageTemplate: srcImg.template }
    } else if (isNPRImage(srcImg)) {
      return { cmsSource: cmsSources.NPR, imageTemplate: srcImg?.template || srcImg }
    } else {
      // fallback
      return fallBackObject
    }
  } else {
    // fallback
    return fallBackObject
  }
}

// central spot to get the images native width and height for layout purposes
export const getImageDimensions = (url: string) => {

  let dim = [0, 0]
  if (typeof url === "string" && /^\d+$/.test(url)) {
    //https://cms.prod.nypr.digital/images/352442/fill-592x395-c0|format-webp|webpquality-80
    // Extract width and height from Wagtail URLs
    const fillMatch = url.match(/fill-(\d+)x(\d+)/);
    dim = fillMatch ? [parseInt(fillMatch[1]), parseInt(fillMatch[2])] : [0, 0];

  } else if (typeof url === "string" && url.includes("media.wnyc.org")) {
    //https://media.wnyc.org/i/165/40/l/80/2022/11/EN_ListenAFOn_AmazonMusic_button_Indigo_RGB.png
    const pathParts = url.split("/i/")[1]?.split("/");
    dim = pathParts && pathParts.length >= 2 ? [parseInt(pathParts[0]), parseInt(pathParts[1])] : [0, 0];
  } else if (
    typeof url === "string" &&
    Array.isArray(NPRIMAGEDOMAINSOURCES) &&
    NPRIMAGEDOMAINSOURCES.some(domain => url.includes(domain))
  ) {
    //https://npr.brightspotcdn.com/dims3/default/strip/false/crop/908x681+58+0/resize/390/quality/80/format/jpg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fb4%2Ff6%2Fe386e5e34eb3bde3acf3b9c1f4d7%2Fgettyimages-2225247729.jpg
    const cropMatch = url.match(/\/crop\/(\d+)x(\d+)/);
    dim = cropMatch ? [parseInt(cropMatch[1]), parseInt(cropMatch[2])] : [0, 0];
  }
  return dim as [number, number]
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
export function howLongAgo(date) {
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
export function getDate(data = null, formatString = "EEE, MMM do") {
  const date = data?.updatedDate || data?.publicationDate
  if (date) {
    const currentYear = new Date().getFullYear()
    const currentDay = new Date().getDate()
    const inputDate = new Date(date)
    const inputYear = inputDate.getFullYear()
    const inputDay = inputDate.getDate()
    if (inputDay !== currentDay) {
      if (inputYear !== currentYear) {
        formatString = `${formatString}, yyyy` // Update formatString to include the year
      }
      return format(inputDate, formatString)
    } else {
      return whenTime(data)
    }
  } else {
    return format(new Date(), formatString)
  }
}

/**
 * to get the desired date format for the header
 */
export function formatDate(date = null, formatString = "EEE, MMM do") {
  if (date) {
    const currentYear = new Date().getFullYear()
    const inputDate = new Date(date)
    const inputYear = inputDate.getFullYear()
    if (inputYear !== currentYear) {
      formatString = `${formatString}, yyyy` // Update formatString to include the year
    }
    return format(inputDate, formatString)
  } else {
    return format(new Date(), formatString)
  }
}

/**
 * to get the yaer for the footer in the settings
 */
export function getYear() {
  return new Date().getFullYear()
}

/**
 * helper function to capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * helper function to change the global font size
 */
export function setFontSize(size: string) {
  document.documentElement.style.fontSize = size
}

/**
 * helper function to toggle darkmode of the status bar
 */
export async function setStatusDarkMode(bool: boolean) {
  if (useIsApp().value) {
    bool
      ? await StatusBar.setStyle({ style: Style.Dark })
      : await StatusBar.setStyle({ style: Style.Light })
  }
}
/**
 * helper function to toggle darkmode
 */
export async function setDarkMode(bool: boolean) {
  // TEMP, no dark ode for browser yet
  const dmBool = useIsApp().value ? bool : false
  dmBool
    ? document.documentElement.classList.add("style-mode-dark")
    : document.documentElement.classList.remove("style-mode-dark")
  await setStatusDarkMode(dmBool)
  const isDarkMode = useIsDarkMode()
  isDarkMode.value = dmBool
}
// function to get the EPISODE fallback image for the episode depending on darkmode
export const getEpisodeFallBackImage = (isDarkMode = true) => {
  return isDarkMode ? FALLBACKIMAGEEPDARK : FALLBACKIMAGEEP
}

// function to get the EPISODE HEADER fallback image for the episode depending on darkmode
export const getEpisodeHeadFallBackImage = (isDarkMode = true) => {
  return isDarkMode ? FALLBACKIMAGEEPHEADDARK : FALLBACKIMAGEEPHEAD
}

// function to get the USER icon fall back image
export const getUserFallBackImage = (isDarkMode = true) => {
  return isDarkMode ? FALLBACKUSERDARK : FALLBACKUSER

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
    capacitorIosNotificationSettings.openNotificationSettings();
  }
}

// get device information
export async function getFullDeviceInfo(): Promise<DeviceInfo | null> {
  try {
    const info = await Device.getInfo();
    return info;
  } catch (error) {
    console.error('Error getting full device info:', error);
    return null;
  }
}

//determine where to send the user to get the app based on their platform or if on browser
export const getAppDownloadLink = async () => {
  const androidStoreUrl = "https://play.google.com/store/apps/details?id=org.wnyc.android";
  const iosStoreUrl = "https://apps.apple.com/us/app/wnyc/id470219771";

  const info = await getFullDeviceInfo();

  if (info?.platform === "android") {
    return androidStoreUrl;
  } else if (info?.platform === "ios") {
    return iosStoreUrl;
  } else if (info?.operatingSystem === 'ios') {
    return iosStoreUrl;
  } else if (info?.operatingSystem === 'android') {
    return androidStoreUrl;
  } else {
    // For web browsers, redirect to the mobile route
    return "/mobile";
  }
};

// helper function to open a link in the browser IN the app
export async function openLinkInAppBrowser(url: string) {
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

// helper function to remove HTML tags from a string
export const removeHTMLTags = (str) => {
  const parser = new DOMParser()
  const parsedHTML = parser.parseFromString(str, "text/html")
  return parsedHTML.body.textContent ?? ""
}

// share API
export const shareAPI = async (
  content,
  componentOfOrigin = "Component of origin not specified"
) => {
  const shareData = {
    title: removeHTMLTags(content.socialTitle || content.title),
    text: removeHTMLTags(content.rawBody || content.description || content.title),
    url: content.url || content.titleLink,
  };

  trackClickEvent("Click Tracking - Share", componentOfOrigin, shareData.title);
  // Native Mobile Sharing
  if (Capacitor.isNativePlatform()) {
    await Share.share({
      title: shareData.title,
      text: shareData.text,
      url: shareData.url,
      dialogTitle: "Share with buddies",
    });
    return; // Exit after native share
  }

  // Web Share API
  if (navigator.share && shareData.url) {
    try {
      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        // User cancelled the share. No action needed.
      } else {
        // Any other error, we fallback to clipboard
        console.error("Web Share API error:", error);
        copyToClipBoard(shareData.url);
      }
    }
  } else {
    // Fallback for browsers without Web Share API or if URL is missing
    if (shareData.url) {
      copyToClipBoard(shareData.url);
    } else {
      console.error("No URL provided to share or copy.");
    }
  }
};

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
          ls.text_size = ls.text_size.label;
        }
        if (typeof ls.default_live_stream === 'object') {
          ls.default_live_stream = ls.default_live_stream.station;
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
          currentUserProfile.value = data

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
          currentUserProfile.value = data

        }

        // update streams and settings
        updateAllLiveStreams()
        setDisplaySettings(data)
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
  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.EPISODE]}${ep.meta?.slug ?? ep.slug}`,
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
  if (Capacitor.getPlatform() === "web" && theLink) {
    if (story.cmsSource === cmsSources.WAGTAIL) {
      // open in new tab if web and wagtail source (Gothamist)
      window.open(theLink, "_blank")
    }
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
/* centralized function to route to a show page */
export const goToShowPage = (show, params = null) => {
  navigateTo({
    path: `${mediaTypeRoutes[mediaTypes.SHOW]}${show.meta?.slug ?? show.slug}`,
    query: params,
  })
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
  return bodyArr
    .filter((item) => item.type === "paragraph")
    .map((item) => item.value.replace(/<\/?[^>]+(>|$)/g, "")) // Strip HTML tags
    .join(" ");
}

// Define the interface for the function parameters
interface AddToFavoritesParams {
  item: any; // Replace 'any' with the actual type of bucketItem
  isFavorited: boolean;
  message?: string;
  callback?: () => void;
}
// function to add to the favorites
export const addToFavorites2 = async ({ item, isFavorited, message = isFavorited ? "Removed from Favorites." : "Added to Favorites.", callback }: AddToFavoritesParams) => {
  const user = useCurrentUser();
  const accountPromptSideBar = useAccountPromptSideBar();
  if (user.value) {
    const globalToast = useGlobalToast();
    const episode = {
      ...item,
      slug: item.meta?.slug ?? item.slug,
      estimatedDuration: item.estimatedDuration || item.duration,
    };
    if (isFavorited) {
      await deleteFavorite(episode);
      getFavoritedItems();
      if (callback) {
        callback();
      }
    } else {
      await saveFavorite(episode, episode.type);
      getFavoritedItems();
      if (callback) {
        callback();
      }
    }
    globalToast.value = {
      severity: "info",
      summary: message,
      life: 3000,
    };
    trackClickEvent(
      `Click Tracking - ${message}`,
      "Episode Item",
      item.title
    );
  } else {
    accountPromptSideBar.value = true;
  }
};

// handles how to use the correct navigate method based on the item type
export const dynamicNavigation = (item, isSaveHistory = true, isDownloaded = false) => {
  const isNetworkConnected = useIsNetworkConnected()
  if (isNetworkConnected.value) {
    switch (item.type) {
      case mediaTypes.LIVE:
        goToLivePage(item, { slug: item.slug, type: item.type }, isSaveHistory)
        break
      case mediaTypes.EPISODE:
      case mediaTypes.SEGMENT:
        goToEpisodePage(item, { src: item.cmsSource, type: item.type }, isSaveHistory)
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
  const oneSignal = useOneSignal();
  oneSignal.requestNotificationPermission();
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

  // sign out from supabase
  await client.auth.signOut()

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
    });
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
    const getValue = (obj, key) => obj[key];

    // get the title without "A " or "The " at the beginning
    const getTitle = (title) => {
      const prefixes = ["A ", "The "];
      for (const prefix of prefixes) {
        if (title.startsWith(prefix)) {
          return title.substring(prefix.length);
        }
      }
      return title;
    };

    const aValue = getTitle(getValue(a, key));
    const bValue = getTitle(getValue(b, key));

    if (aValue !== bValue) {
      return aValue.localeCompare(bValue);
    }

    return a.localeCompare(b);
  };
};

// function that converts and array to a set to remove the dups
export const deduplicateArray = (array) => {
  return [...new Set(array)];
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
export function getPathAndQuery(urlString) {
  try {
    const url = new URL(urlString);
    return `${url.pathname}${url.search}`;
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
}