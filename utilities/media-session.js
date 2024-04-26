import { MediaSession } from '@jofr/capacitor-media-session'
import { getDate, imageSolver } from '~/utilities/helpers'
import { useIsNetworkConnected } from "~/composables/states"
import { FALLBACKIMAGE } from "~/composables/globals"
import axios from 'axios'
let currentEpisode = null
let playbackStopped = true
let audioElement = null
const updatePlaybackState = () => {
    const playbackState = playbackStopped ? 'none' : (audioElement.paused ? 'paused' : 'playing')
    MediaSession.setPlaybackState({
        playbackState: playbackState
    })
}

const updatePositionState = () => {
    MediaSession.setPositionState({
        position: audioElement.currentTime,
        duration: audioElement.duration,
        playbackRate: audioElement.playbackRate
    })
}

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

    //have to get the format for publisher images
    const format = await fetchMimeType(imageSolver(image, { w: 116, h: 116, q: 80, format: 'jpeg' }))
    const arr = []
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
export const initMediaSession = async (episode, skipTime) => {
    const isNetworkConnected = useIsNetworkConnected()
    if (!isNetworkConnected.value) return
    currentEpisode = episode

    // if this episode has a directory image, that means it has been downloaded, so to use the downloaded im age in the media session, otherwise use the image from the API response as normal
    const artworkImageArray = currentEpisode?.directoryImage?.uri ? [{ src: currentEpisode.directoryImage.uri }] : await generateMediaSessionArtworkArray(currentEpisode.image)

    // Wait for the images to load before setting the media session metadata
    // this fixes the bug where the images sometimes do not load initially
    await Promise.all(artworkImageArray.map(image => {
        return new Promise((resolve) => {
            const img = new Image()
            img.src = image.src
            img.onload = () => resolve()
            img.onerror = () => {
                img.src = FALLBACKIMAGE // Set your fallback image URL here
                resolve(img) // Resolve the promise with the fallback image
            }
        })
    }))

    await nextTick()
    MediaSession.setMetadata({
        title: currentEpisode.title,
        artist: getDate(currentEpisode),
        album: currentEpisode.showTitle,
        artwork: artworkImageArray
    })

    const mediaProvider = document.querySelector('media-provider')
    audioElement = mediaProvider.querySelector('audio, video')

    audioElement.addEventListener('durationchange', updatePositionState)
    audioElement.addEventListener('seeked', updatePositionState)
    audioElement.addEventListener('ratechange', updatePositionState)
    audioElement.addEventListener('play', updatePositionState)
    audioElement.addEventListener('pause', updatePositionState)

    audioElement.addEventListener('play', () => {
        playbackStopped = false
        updatePlaybackState()
    })
    audioElement.addEventListener('pause', updatePlaybackState)


    MediaSession.setActionHandler({ action: 'play' }, () => {
        audioElement.play()
    })

    MediaSession.setActionHandler({ action: 'pause' }, () => {
        audioElement.pause()
    })

    MediaSession.setActionHandler({ action: 'seekto' }, (details) => {
        audioElement.currentTime = details.seekTime
    })

    MediaSession.setActionHandler({ action: 'seekforward' }, () => {
        const seekOffset = skipTime
        audioElement.currentTime = audioElement.currentTime + seekOffset
    })

    MediaSession.setActionHandler({ action: 'seekbackward' }, () => {
        const seekOffset = skipTime
        audioElement.currentTime = audioElement.currentTime - seekOffset
    })

    MediaSession.setActionHandler({ action: 'stop' }, () => {
        playbackStopped = true
        audioElement.pause()
    })
}
