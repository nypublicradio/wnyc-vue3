import {
  useIsLiveStream,
  useCurrentUserProfile,
  useCurrentEpisodeHolder,
  useCurrentEpisode,
} from "~/composables/states"

import {
  togglePlayEpisode,
  playLocalMp3,
} from "~/utilities/helpers"
import { mediaTypes } from "~/composables/globals"

// Function to initialize continuous play feature.
export const useContinuousPlay = () => {

  const currentEpisodeHolder = useCurrentEpisodeHolder()
  const currentEpisode = useCurrentEpisode()
  const isLiveStream = useIsLiveStream()
  const currentUser = useCurrentUserProfile()

  // Function to initialize continuous play feature. 
  const initContinuousPlay = () => {

    // if the user has continuous play enabled, then we want to play the next episode
    if (!isLiveStream.value && currentUser.value?.continuous_play) {
      // technically, a live stream would never end, so this is a bit redundant

      // slight delay to allow the player to close before the live stream starts
      setTimeout(() => {
        // play the live stream audio bumper based on what is currently selected/last played, then when the bumper is done, play the live stream
        let checkInterval: ReturnType<typeof setInterval> | null = null
        const bumper = playLocalMp3(
          `/live-stream-audio-bumpers/${currentEpisodeHolder.value.slug}.mp3`,
          () => {
            if (checkInterval) clearInterval(checkInterval)
            checkInterval = null
            togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
          }
        )
        // detect if an episode is changed while the bumper is playing, and if so, pause the bumper
        const currentEP = currentEpisode.value
        checkInterval = setInterval(() => {
          if (currentEpisode.value !== currentEP) {
            bumper?.stopBumper()
            if (checkInterval) clearInterval(checkInterval)
            checkInterval = null
          }
        }, 250)

      }, 500)
    }
  }

  return {
    initContinuousPlay
  }
}