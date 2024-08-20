import { getDate, imageSolver } from '~/utilities/helpers'
import { useIsNetworkConnected, useIsApp, useIsLiveStream } from "~/composables/states"
import { FALLBACKIMAGE/* , PLAYER_SKIP_TIME */ } from "~/composables/globals"
import axios from 'axios'
import { RemoteStreamer } from "@nypublicradio/capacitor-remote-streamer"
let currentEpisode = null

const defaultMimeType = 'image/jpeg'
const imageSizes = [128, 256, 512, 1024]

// fetch the image type from the server
const fetchMimeType = async (imageUrl) => {
    try {
        const response = await axios(imageUrl, { method: 'HEAD' }) // Use 'HEAD' to avoid downloading the image
        return response.headers["content-type"] || defaultMimeType
    } catch (error) {
        return defaultMimeType
    }
}

// generate an array of artwork objects with different sizes and using an axios call to get the image type
const generateMediaSessionArtworkArray = async (image) => {
    const arr = []

    //have to get the format for publisher images
    const format = await fetchMimeType(imageSolver(image, { w: 116, h: 116, q: 80, format: 'jpeg' }))
    imageSizes.forEach(size => {
        arr.push({
            src: imageSolver(image, { w: size, h: size, q: 80 }),
            sizes: `${size}x${size}`,
            type: format
        })
    })
    return arr
}

// initialize the media session with the episode data
export const initMediaSession = async (episode/* , skipTime = PLAYER_SKIP_TIME */) => {
    if (!episode) return
    const isNetworkConnected = useIsNetworkConnected()
    const isLiveStream = useIsLiveStream()
    const isApp = useIsApp()

    currentEpisode = episode

    // if this episode has a directory image, that means it has been downloaded, so to use the downloaded im age in the media session, otherwise use the image from the API response as normal
    const artworkImageArray = currentEpisode?.directoryImage?.uri & !isNetworkConnected.value ? [{ src: currentEpisode.directoryImage.uri }] : await generateMediaSessionArtworkArray(currentEpisode.image)


    if (isApp.value) {

        let artworkImageUrl = FALLBACKIMAGE // Set your fallback image URL here

        if (currentEpisode?.directoryImage?.uri && !isNetworkConnected.value) {
            //can't figure out how to use the locally stored image from capacitor, we may need to do a base64 thing, and/or update the plugin to handle the file path
            //const convertedSavedImageSrc = currentEpisode.directoryImage.uri
            // make empty string to show no image for now
            artworkImageUrl = ''
        } else if (artworkImageArray?.src) {
            artworkImageUrl = artworkImageArray.src
        } else if (artworkImageArray[2]?.src) {
            artworkImageUrl = artworkImageArray[2].src
        }

        await RemoteStreamer.setNowPlayingInfo({
            title: currentEpisode.title,
            artist: getDate(currentEpisode),
            album: currentEpisode.showTitle,
            duration: !isLiveStream.value ? String(currentEpisode.duration) : null,
            imageUrl: artworkImageUrl,
            isLiveStream: isLiveStream.value,
        })
    } else {
        if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentEpisode.title,
                artist: getDate(currentEpisode),
                album: currentEpisode.showTitle,
                artwork: artworkImageArray
            })
        }
    }
}
