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


const bottomMenuState: object = {}
/**
 * Global state for the bottom navigation
 */
export const useBottomMenuState = () => useState('bottomMenuState', () => bottomMenuState)


/**
 * Global state for the navigation
 */
const navigationObj: object | any = null
export const useNavigation = () => useState('navigation', () => navigationObj)

/**
 * Global state for the app directory location
 */
const appDirectory: string = "wnyc-downloads"
export const useAppDirectory = () => useState('appDirectory', () => appDirectory)

/**
 * Global state for the fileSystem
 */
const fileSystem: any = []
export const useFileSystem = () => useState('fileSystem', () => fileSystem)

// Local Storage version of the fileSystem
// import { Preferences } from '@capacitor/preferences';
// const fileSystemLS: any = await Preferences.get({ key: 'files' })
// export const useFileSystemLS = () => useState('fileSystemLS', () => JSON.parse(fileSystemLS.value) || [])
export const useFileSystemLS = () => useState('fileSystemLS', () => [])
