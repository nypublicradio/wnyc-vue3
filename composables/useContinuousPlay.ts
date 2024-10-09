import {
  useIsLiveStream,
  useCurrentUserProfile,
  useCurrentEpisodeHolder,
} from "~/composables/states"

import {
  togglePlayEpisode,
  playLocalMp3,
} from "~/utilities/helpers"

// Function to initialize continuous play feature.
export const useContinuousPlay = () => {

  const currentEpisodeHolder = useCurrentEpisodeHolder()
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
        playLocalMp3(
          `/live-stream-audio-bumpers/${currentEpisodeHolder.value.slug}.mp3`,
          () => togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
        )
      }, 500)
    }
  }

  return {
    initContinuousPlay
  };
}
