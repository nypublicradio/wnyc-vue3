import { MediaSession } from '@jofr/capacitor-media-session'
import { getDate, resizePublisherImageUrl } from '~/utilities/helpers'

let initFlag = false
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

async function getImageType(url) {
    const response = await fetch(url, { method: 'HEAD' })
    return response.headers.get('Content-Type')
}

export const initMediaSession = async (episode, skipTime) => {
    currentEpisode = episode
    const type = await getImageType(resizePublisherImageUrl(currentEpisode.image, 512, 512))
    console.log('type', type)
    MediaSession.setMetadata({
        title: currentEpisode.title,
        artist: getDate(currentEpisode.updatedDate ?? currentEpisode.publicationDate),
        album: currentEpisode.showTitle,
        artwork: [
            { src: resizePublisherImageUrl(currentEpisode.image, 512, 512), type: type, sizes: '512x512' }
        ]
    })

    if (!initFlag) {
        console.log('once')
        initFlag = true

        audioElement = document.querySelector('audio')

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

        MediaSession.setActionHandler({ action: 'seekforward' }, (details) => {
            const seekOffset = skipTime
            audioElement.currentTime = audioElement.currentTime + seekOffset
        })

        MediaSession.setActionHandler({ action: 'seekbackward' }, (details) => {
            const seekOffset = skipTime
            audioElement.currentTime = audioElement.currentTime - seekOffset
        })

        MediaSession.setActionHandler({ action: 'stop' }, () => {
            playbackStopped = true
            audioElement.pause()
        })
    }
}
