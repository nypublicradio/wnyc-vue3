import { MediaSession } from '@jofr/capacitor-media-session'
import { getDate, resizePublisherImageUrl } from '~/utilities/helpers'

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
    console.log('audioElement  = ', audioElement)
    MediaSession.setPositionState({
        position: audioElement.currentTime,
        duration: audioElement.duration,
        playbackRate: audioElement.playbackRate
    })
}

export const initMediaSession = (episode, skipTime) => {
    currentEpisode = episode

    // if this episode has a directory image, that means it has been downloaded, so to use the downloaded im age in the media session, otherwise use the image from the API response as normal
    const artworkImage = currentEpisode?.directoryImage?.uri ? currentEpisode.directoryImage.uri : resizePublisherImageUrl(currentEpisode.image, 512, 512)
    MediaSession.setMetadata({
        title: currentEpisode.title,
        artist: getDate(currentEpisode.updatedDate ?? currentEpisode.publicationDate),
        album: currentEpisode.showTitle,
        artwork: [{ src: artworkImage }]
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
