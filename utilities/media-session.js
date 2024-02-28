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

export const initMediaSession = (episode, skipTime) => {
    currentEpisode = episode
    MediaSession.setMetadata({
        title: currentEpisode.title,
        artist: getDate(currentEpisode.updatedDate ?? currentEpisode.publicationDate),
        album: currentEpisode.showTitle,
        artwork: [
            { src: resizePublisherImageUrl(currentEpisode.image, 512, 512), type: 'image/jpg', sizes: '512x512' }
        ]
        // artwork: [
        //     { src: 'https://dummyimage.com/96x96', sizes: '96x96', type: 'image/png' },
        //     { src: 'https://dummyimage.com/128x128', sizes: '128x128', type: 'image/png' },
        //     { src: 'https://dummyimage.com/192x192', sizes: '192x192', type: 'image/png' },
        //     { src: 'https://dummyimage.com/256x256', sizes: '256x256', type: 'image/png' },
        //     { src: 'https://dummyimage.com/384x384', sizes: '384x384', type: 'image/png' },
        //     { src: 'https://dummyimage.com/512x512', sizes: '512x512', type: 'image/png' },
        // ]
    })
    // test for ios
    navigator.mediaSession.metadata = new MediaMetadata({
        title: currentEpisode.title,
        artist: getDate(currentEpisode.updatedDate ?? currentEpisode.publicationDate),
        album: currentEpisode.showTitle,
        artwork: [{ src: resizePublisherImageUrl(currentEpisode.image, 512, 512) }]
    })

    if (!initFlag) {
        initFlag = true

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
}
