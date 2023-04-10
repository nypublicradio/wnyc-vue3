// audio player globals
const currentEpisodeObj = null
/**
 * Global state for the current episode object. 
 */
export const useCurrentEpisode = () => useState('useCurrentEpisode', () => currentEpisodeObj)

const currentEpisodeHolderObj = null
/**
 * Global state for the current episode object. 
 */
export const useCurrentEpisodeHolder = () => useState('useCurrentEpisodeHolder', () => currentEpisodeHolderObj)

const allCurrentStationsObj = null
/**
 * Global state for ALL the current episodes object. 
 */
export const useAllCurrentStations = () => useState('useAllCurrentStations', () => allCurrentStationsObj)

const isEpisodePlaying = false
/**
 * Global state for the current Howler sound playing.
 */
export const useIsEpisodePlaying = () => useState('useIsEpisodePlaying', () => isEpisodePlaying)

const isPlayerMinimized = false
/**
 * Global state for the audio player minimize.
 */
export const useIsPlayerMinimized = () => useState('useIsPlayerMinimized', () => isPlayerMinimized)

const togglePlayTrigger = false
/**
 * Global state for the current play toggle for player play-toggle prop.
 */
export const useTogglePlayTrigger = () => useState('useTogglePlayTrigger', () => togglePlayTrigger)

/**
 * Global var for the height of the audio player
 */
export const audioPlayerHeight = 100

const currentStreamStation = 'wnyc-fm939'
/**
 * Global state for the current streaming station / initial selection in the stream switcher dropdown. 
 */
export const useCurrentStreamStation = () => useState('useCurrentStreamStation', () => currentStreamStation)

/**
 * Global state for the navigation
 */
const navigationObj: object | any = null
export const useNavigation = () => useState('navigation', () => navigationObj)