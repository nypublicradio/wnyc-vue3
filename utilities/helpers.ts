import { format, formatDistanceToNowStrict } from "date-fns"
import { StatusBar, Style } from "@capacitor/status-bar"
import {
  useCurrentEpisode,
  useTextSizeOption,
  useIsApp,
  useCurrentUser,
  useCurrentUserProfile,
  useLocalUserProfileDefault,
  useCurrentUserFavorites,
  useTogglePlayTrigger,
} from "~/composables/states"
import { Preferences } from "@capacitor/preferences"
import { NativeSettings, AndroidSettings, IOSSettings } from "capacitor-native-settings"
import { Browser } from "@capacitor/browser"
import { mediaTypeRoutes } from "~/composables/globals"
import { updateAllLiveStreams } from "~/composables/data/liveStream"
import axios from "axios"
import { FALLBACKIMAGELOCAL } from "../composables/globals"
//import { useSupabaseClient } from '@nuxtjs/supabase'


// format ISO timestamp to return only the time
export function formatTime(date: any) {
  if (date) {
    const dateObject = new Date(date)
    return format(dateObject, "h:mm a")
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

interface ImageAttributes {
  imageMain?: {
    template: string
  }
  image?: {
    template: string
  }
}

/**
 *  Function to fetch duration from an mp3 file
 * @param {string} url - url of the mp3 file
 * @returns {number} - duration of the mp3 file in seconds
 */
export const fetchDuration = async (url: string) => {
  try {
    const options = {
      method: "HEAD",
      url: url,
    }
    const mp3Res = await axios(options)
    const mp3Size = mp3Res.headers["content-length"]
    // Calculate the duration in seconds not converting size into bits.
    // The bitrate is 128kps according to vlc and the file size is in bytes.
    //Multiplying the file size by 8 and dividing by 128000 gives the same
    //duration as dividing by 16000 and not multiplying the file size by 8.
    const duration: number = Math.round(mp3Size / 16000)
    return duration
  } catch (e) {
    //console.log(e);
  }
  return null
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
// returns a templated image url when provided just the image URL
export const templatizePublisherImageUrl = (url: string): string => {
  if (url?.includes("media.wnyc.org")) {
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
  } else {
    return url
  }
}

// function that tracks audio events to google analytics
export const trackAudioEvent = (eventName, audioType, audioTitle, audioShow) => {
  const { $analytics } = useNuxtApp()
  const currentUser = useCurrentUser()
  $analytics.sendEvent(eventName, {
    audio_type: audioType,
    audio_title: audioTitle,
    audio_show: audioShow,
    user_id: currentUser.value?.id
  })
}

// function that tracks click events to google analytics
export const trackClickEvent = (category, component, label) => {
  const { $analytics } = useNuxtApp()
  const currentUser = useCurrentUser()
  $analytics.sendEvent("click_tracking", {
    event_category: category,
    component: component,
    event_label: label,
    user_id: currentUser.value?.id
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
export function getDate(date = null, formatString = "EEE, MMM do") {
  if (!date) {
    return format(new Date(), formatString)
  } else {
    return format(new Date(date), formatString)
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
  bool
    ? document.documentElement.classList.add("style-mode-dark")
    : document.documentElement.classList.remove("style-mode-dark")
  await setStatusDarkMode(bool)
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
  NativeSettings.open({
    optionAndroid: AndroidSettings.ApplicationDetails,
    optionIOS: IOSSettings.App,
  })
}

// helper function to open a link in the browser IN the app
export async function openLinkInAppBrowser(url: string) {
  await Browser.open({ url })
}

// returns the time since the episode was published, but checks for updated_date first
export const whenTime = (data) => {
  const res = data.updatedDate
    ? howLongAgo(data.updatedDate)
    : data.publicationDate
      ? howLongAgo(data.publicationDate)
      : data.publishAt
        ? howLongAgo(data.publishAt)
        : howLongAgo(data.firstPublishedAt)
  return res
}

// returns the rounded up minutes duration of the episode
export const getMinutes = (ms, mult = 1000) => {
  const seconds = Math.round(ms / mult)
  const minutes = Math.round(seconds / 60)
  //const remainingSeconds = seconds % 60
  //remainingSeconds > 30 ? minutes++ : minutes
  return `${minutes} min`
}

// global funcrtion for copying to clipboard
export const copyToClipBoard = async (content: string) => {
  if (!navigator.clipboard) return false
  await navigator.clipboard
    .writeText(content)
    .then(() => {
      return true
    })
    .catch(() => {
      return false
    })
  return null
}

/*basic function that detects if the site is running in a mobile browser*/
function isMobileBrowser() {
  return (
    typeof window.orientation !== "undefined" ||
    navigator.userAgent.indexOf("IEMobile") !== -1
  )
}

export const removeHTMLTags = (str) => {
  const parser = new DOMParser();
  const parsedHTML = parser.parseFromString(str, 'text/html');
  return parsedHTML.body.textContent ?? '';
}
// share API
export const shareAPI = async (content: object, componentOfOrigin = 'Component of origin not specified') => {

  // DESKTOP sharing is not supported yet

  const shareContent = {
    title: removeHTMLTags(content.title),
    text: removeHTMLTags(content.details || content.description),
    url: content.url,
  }

  trackClickEvent(
    "Click Tracking - Share",
    componentOfOrigin,
    shareContent.title
  )

  //console.log('shareContent = ', shareContent)
  if (navigator.canShare(shareContent) && isMobileBrowser()) {
    await navigator.share(shareContent)
    return true
  } else {
    return false
  }
}

// time converter
export const convertTime = (val) => {
  const hhmmss = new Date(val * 1000).toISOString().substring(11, 19)
  return hhmmss.startsWith("00:") ? hhmmss.substring(3) : hhmmss
}

export const getAndSetUserProfile = async () => {
  const currentUser = useCurrentUser()
  const currentUserProfile = useCurrentUserProfile()
  const localUserProfileDefault = useLocalUserProfileDefault()
  const config = useRuntimeConfig()
  const client = useSupabaseClient()
  const user = await client.auth.getSession()

  // function that gets a user profile
  const getProfile = async () => {
    const { data, error } = await client
      .from("profiles")
      .select("*")
      .eq("id", currentUser.value.id)
      .single()
    if (error) {
      console.error(error)
    } else if (data) {
      if (data.initial) {
        // if first time logging in with new profile
        const lsSTRING = await Preferences.get({ key: "localUserProfile" })
        const ls = JSON.parse(lsSTRING.value)
        data.initial = false
        data.autodownload = ls.autodownload
        data.default_live_stream = ls.default_live_stream.label
        data.receive_general_notifications = ls.receive_general_notifications
        data.dark_mode = ls.dark_mode
        data.text_size = ls.text_size.label

        // update supabase profile data
        // set the supabase prferences with what is currently set in the local storage
        await client
          .from("profiles")
          .update({
            initial: false,
            autodownload: ls.autodownload,
            default_live_stream: ls.default_live_stream.label,
            receive_general_notifications: ls.receive_general_notifications,
            dark_mode: ls.dark_mode,
            text_size: ls.text_size.label,
          })
          .match({ id: currentUser.value.id })
      }

      // set the current user profile state
      currentUserProfile.value = data
      updateAllLiveStreams()
      setDisplaySettings(data)
    }
  }

  //

  // check local storage for the auth token
  if (process.client) {
    const supabaseAuthToken = await Preferences.get({
      key: config.public.supabaseAuthTokenName,
    })

    if (supabaseAuthToken.value) {
      currentUser.value = JSON.stringify(supabaseAuthToken.user)
    }

    // check supabase session for logged in user
    if (user?.data?.session?.user) {
      currentUser.value = user?.data?.session?.user
    }

    if (!currentUser.value) {
      // initially set default user profile settings or use the local storage settings

      // does local storage settings exist?
      const isLocalUserProfile = await Preferences.get({ key: "localUserProfile" })
      if (!isLocalUserProfile.value) {
        // no, set defaults from localUserProfileDefault state
        const defaults = localUserProfileDefault.value

        //get the system's current theme and apply it to the initial defaults
        defaults.dark_mode = detectSystemDarkMode()

        const defaultsSTRING = JSON.stringify(defaults)
        await Preferences.set({
          key: "localUserProfile",
          value: defaultsSTRING,
        })
        currentUserProfile.value = localUserProfileDefault.value

        updateAllLiveStreams()
        //set display settings
        setDisplaySettings(localUserProfileDefault.value)
      } else {
        // local storage is set, so set currentUserProfile to the local storage settings
        currentUserProfile.value = JSON.parse(isLocalUserProfile.value)

        updateAllLiveStreams()
        //set display settings
        setDisplaySettings(currentUserProfile.value)
      }
      //navigateTo('/home')
    } else {
      // if they are a user, get their profile data
      getProfile()
      getFavoritedItems()
    }
  }
}
interface SavedItem {
  uid: string
  type: string
  cmsSource: string
  media_id: string
  slug: string
  route_href: string
  title: string
  image: any
  producingOrganizations: any
  authors: any
  meta: any
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

export const saveFavorite = async (media: object, typeArg: string, tableArg = "favorited") => {
  const user = useCurrentUser()
  const source = media?.cmsSource ?? media?.cmsSource
  const thisSlug = media?.slug ?? media?.meta.slug ?? media?.id
  const href = `${mediaTypeRoutes[typeArg]}${thisSlug}`

  if (user.value) {
    // format the media object to save
    const uid = user.value?.id
    const cmsSource = source
    const media_id = media?.id
    const slug = thisSlug
    const type = typeArg
    const route_href = href
    const image = media?.image
    const title = media?.title
    const producingOrganizations = media?.producingOrganizations
    const authors = media?.authors
    const meta = media?.meta
    const itemToSave: SavedItem = {
      uid,
      type,
      cmsSource,
      media_id,
      slug,
      route_href,
      image,
      title,
      authors,
      producingOrganizations,
      meta,
    }
    //console.log('itemToSave = ', itemToSave)
    //save instance to Supabase
    const client = useSupabaseClient()
    const { error } = await client.from(tableArg).insert([itemToSave])
    console.error('error = ', error)
  }
}

export const deleteFavorite = async (media: object) => {
  // detect if logged in
  const user = useCurrentUser()
  if (user.value) {
    // format the media object to save
    const uid = user.value?.id
    const slug = media?.slug ?? media?.meta.slug
    const media_id = media?.id
    //save instance to Supabase
    const client = useSupabaseClient()
    const { error } = await client
      .from("favorited")
      .delete()
      .eq("uid", uid)
      .or(`slug.eq.${slug}`, `media_id.eq.${media_id}`)

    if (error) {
      console.error("error deleting favorite", error)
    }
  }
}

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

export const checkIsFavorited = (slug: string) => {
  const user = useCurrentUser()
  if (user.value) {
    const favorites = useCurrentUserFavorites()
    if (favorites.value) {
      const result = favorites.value.find((item) => item.slug === slug || item.media_id === slug)
      return result ? true : false
    }
  }
  return false
}

export const saveRecentlyPlayed = (media: object, typeArg: string) => {
  saveFavorite(media, typeArg, "recently_viewed")
}

// normalize the bucket item data for the player
export const prepForPlayer = (item, index = null) => {
  const isSegment = index !== null

  const fileValue = item.file?.includes("blob:") ? item.file : isSegment ? item.audio[index] : item.audio

  return {
    ...item,
    file: fileValue,
    title: isSegment ? item.segments[index].title : item.title,
    image: item?.image?.template ?? item?.listingImage?.template ?? item?.showImage ?? FALLBACKIMAGELOCAL,
    duration: item.estimatedDuration,
    details: isSegment ? item.segments[index].tease : item.body,
    first_published_at: isSegment ? item.segments[index].newsdate : item.publishAt,
  }
}

// handles playing episodes and segments
export const togglePlayEpisode = async (media, index = 0) => {
  const currentEpisode = useCurrentEpisode()
  const togglePlayTrigger = useTogglePlayTrigger()


  if (typeof media.audio === "string") {
    if (currentEpisode.value?.audio !== media.audio) {
      currentEpisode.value = await prepForPlayer(media)
      saveRecentlyPlayed(media, mediaTypes.EPISODE)
    }
  } else {
    // segment
    if (currentEpisode.value?.file !== media.audio[index]) {
      currentEpisode.value = await prepForPlayer(media, index)
      saveRecentlyPlayed(media, mediaTypes.EPISODE)
    }
  }
  togglePlayTrigger.value = !togglePlayTrigger.value
}


export const getCssVar = (name: string, px = false) => {

  const val = getComputedStyle(document.documentElement).getPropertyValue(
    name
  )

  return px ? val : Number(parseInt(val))

}

/* centralized function to route to a episode page */
export const goToEpisodePage = (ep, params) => {
  navigateTo(`/browse/shows/episode/${ep.meta.slug}${params ? `?${params}` : ''}`)
}

/* centralized function to route to a story page */
export const goToStoryPage = (story, params) => {
  navigateTo(`/story/${story.id}${params ? `?${params}` : ''}`)
}

// return bool if the url has a query param
export const hasQueryParams = (url) => {
  const parsedUrl = new URL(url);
  return parsedUrl.searchParams.toString().length > 0;
}

export const hasAudio = (audio) => {
  return (
    audio !== undefined &&
    audio !== null &&
    audio !== "" &&
    !(Array.isArray(audio) && audio.length === 0)
  )
}

// Function to strip HTML tags and return text content
function stripHtmlTags(str) {
  const parser = new DOMParser();
  const dom = parser.parseFromString(str, 'text/html');
  return dom.body.textContent || '';
}

// Computed property to calculate reading time
export const getReadingTime = (htmlContent) => {
  const textContent = stripHtmlTags(htmlContent);
  const wordsPerMinute = 200; // Average reading speed
  const estimatedWordCount = textContent.split(/\s+/).length;
  return `${Math.ceil(estimatedWordCount / wordsPerMinute)} min read`;
};