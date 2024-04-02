import { MediaSession } from '@jofr/capacitor-media-session'
import { getDate, resizePublisherImageUrl } from '~/utilities/helpers'
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
const imageSizes = [96, 128, 192, 256, 384, 512]

const fetchMimeType = async (imageUrl) => {
    try {
        const response = await axios(imageUrl, { method: 'HEAD' }) // Use 'HEAD' to avoid downloading the image

        if (response.headers["content-type"]) {
            return response.headers["content-type"]
        } else {
            return defaultMimeType
        }
    } catch (error) {
        return defaultMimeType
    }
}

const generateMediaSessionArtworkArray = async (image) => {
    const format = await fetchMimeType(resizePublisherImageUrl(image, 116, 116))
    const arr = []
    imageSizes.forEach(size => {
        arr.push({
            src: resizePublisherImageUrl(image, size, size),
            sizes: `${size}x${size}`,
            type: format
        })
    })
    return arr
}

export const initMediaSession = async (episode, skipTime) => {
    currentEpisode = episode

    // if this episode has a directory image, that means it has been downloaded, so to use the downloaded im age in the media session, otherwise use the image from the API response as normal
    const artworkImageArray = currentEpisode?.directoryImage?.uri ? [{ src: currentEpisode.directoryImage.uri }] : await generateMediaSessionArtworkArray(currentEpisode.image)

    MediaSession.setMetadata({
        title: currentEpisode.title,
        artist: getDate(currentEpisode.updatedDate ?? currentEpisode.publicationDate),
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
