import { RemoteStreamer } from "@nypublicradio/capacitor-remote-streamer"
import {
  useIsLiveStream,
  useCurrentUserProfile,
  useCurrentEpisodeHolder,
  useIsPlayingBumper,
} from "~/composables/states"

import { togglePlayEpisode } from "~/utilities/helpers"
import { mediaTypes } from "~/composables/globals"
import { usePlaylistQueue } from "~/composables/usePlaylistQueue"

// What plays after an on-demand item ends, when the user has continuous play on.
// Nothing here waits on timers: the app may be in the background with the screen off,
// where the native player only keeps it running for a short while after an item ends.
export const useContinuousPlay = () => {

  const currentEpisodeHolder = useCurrentEpisodeHolder()
  const isLiveStream = useIsLiveStream()
  const currentUser = useCurrentUserProfile()
  const isPlayingBumper = useIsPlayingBumper()
  const { playNextInPlaylist } = usePlaylistQueue()

  // technically, a live stream would never end, so the live check is a bit redundant
  const isOn = () => !isLiveStream.value && Boolean(currentUser.value?.continuous_play)

  const playLiveStream = () => {
    togglePlayEpisode(currentEpisodeHolder.value, mediaTypes.LIVE)
  }

  // play the next item in the playlist queue, returns false when continuous play is off or nothing in the queue comes next
  const playNextAfterEnd = () => isOn() && playNextInPlaylist()

  // play the live stream audio bumper based on what is currently selected/last played, then when the bumper is done, play the live stream
  // the bumper is bundled with the app and played by the native player, so it also plays in the background
  const playLiveStreamAfterEnd = async () => {
    if (!isOn()) return
    isPlayingBumper.value = true
    try {
      await RemoteStreamer.play({
        url: `bundle:live-stream-audio-bumpers/${currentEpisodeHolder.value.slug}.mp3`,
        enableCommandCenter: true,
        enableCommandCenterSeek: false,
      })
    } catch (error) {
      // no bumper for this station
      console.warn("Live stream bumper not played:", error)
      isPlayingBumper.value = false
      playLiveStream()
    }
  }

  // the end of the bumper starts the live stream, returns false when it wasn't the bumper that ended
  const bumperEnded = () => {
    if (!isPlayingBumper.value) return false
    isPlayingBumper.value = false
    playLiveStream()
    return true
  }

  // anything else starting replaces the bumper
  const cancelBumper = () => {
    isPlayingBumper.value = false
  }

  return {
    playNextAfterEnd,
    playLiveStreamAfterEnd,
    bumperEnded,
    cancelBumper,
  }
}
