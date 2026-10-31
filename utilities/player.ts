// small pure helpers for the audio player (components/AudioPlayer.vue and the player components)

type Episode = Record<string, any> | null | undefined

// the url the player plays for an episode: the live stream first, then the (downloaded) file, then the audio
export const getStreamUrl = (episode: Episode): string =>
  episode?.hls || episode?.file || episode?.audio || ""

// whether a duration from the player is real: Android sends 0 while it doesn't know it, web sends Infinity for a live stream
export const isKnownDuration = (duration: unknown): duration is number =>
  typeof duration === "number" && Number.isFinite(duration) && duration > 0

// whether the live episode in the player is the given station, by slug, or by stream when either has no slug
export const isSameLiveStation = (episode: Episode, station: Episode): boolean => {
  if (!episode || !station) return false
  if (episode.slug && station.slug) return episode.slug === station.slug
  return Boolean(episode.hls) && episode.hls === station.hls
}

// the volume one arrow key press away, in 0.1 steps between 0 and 1 (the web player throws outside of that)
export const stepVolume = (volume: number, step: number): number =>
  Math.min(1, Math.max(0, Math.round((volume + step) * 10) / 10))

// live stream media ids from CarPlay / Android Auto are "live:<station slug>" (see MediaIds in wnyc-auto)
const LIVE_MEDIA_ID_PREFIX = "live:"

// metadata the native player sends when playback started natively (CarPlay, Android Auto, Google Assistant)
export interface AutoPlayData {
  mediaId?: string
  id?: string
  isLive?: boolean
  streamUrl?: string
  title?: string
  artist?: string
  imageUrl?: string
  duration?: number
}

// a minimal episode for an item that started playing natively. It has no page behind it, so it is
// marked (fromAuto, hideFavorite) to hide the actions that need one, like favorite, download and share
export const buildAutoPlayEpisode = (data: AutoPlayData) => {
  const mediaId = data.mediaId || data.id || ""
  const episode: Record<string, any> = {
    id: mediaId,
    title: data.title || mediaId,
    showTitle: data.artist || "",
    station: data.artist || "",
    player_image: data.imageUrl || null,
    image: data.imageUrl || null,
    duration: data.duration || 0,
    estimatedDuration: data.duration || 0,
    fromAuto: true,
    hideFavorite: true,
  }

  if (data.isLive) {
    episode.hls = data.streamUrl || ""
    // the station slug, so the app can tell which of its stations this is
    const stationSlug = mediaId.startsWith(LIVE_MEDIA_ID_PREFIX)
      ? mediaId.slice(LIVE_MEDIA_ID_PREFIX.length)
      : ""
    if (stationSlug) episode.slug = stationSlug
  } else {
    episode.audio = data.streamUrl || ""
    episode.file = data.streamUrl || ""
  }
  return episode
}
