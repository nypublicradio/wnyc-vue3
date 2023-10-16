// Homepage data
// // global state for the Bff useHomepageData data
// export const useHomepageData = () => useState('useHomepageData', () => null)

// defualt seettings that are over writted by user data
const localUserProfileDefault: object = {
    autodownload: false,
    default_live_stream: 'WNYC 93.9 FM',
    receive_general_notifications: true,
    text_size: 'Normal',
    dark_mode: false,
}
/**
 * Global state for the settings data
 */
export const useLocalUserProfileDefault = () => useState('localUserProfileDefault', () => localUserProfileDefault)

const currentUser = null
// global state for the current authorized user
export const useCurrentUser = () => useState('useCurrentUser', () => currentUser)

const currentUserProfile = null
// global state for the current authorized user's profile
export const useCurrentUserProfile = () => useState('useCurrentUserProfile', () => currentUserProfile)

// setting sidebar state
export const useSettingSideBar = () => useState('useSettingSideBar', () => false)

// login sidebar state
export const useLoginSideBar = () => useState('useLoginSideBar', () => false)

// signin sidebar state
export const useSignupSideBar = () => useState('useSignupSideBar', () => false)

// signin sidebar state
export const useForgotPasswordSideBar = () => useState('useForgotPasswordSideBar', () => false)

// edit profile sidebar state
export const useEditProfileSideBar = () => useState('useEditProfileSideBar', () => false)


// global state if this instance is a native app
export const useIsApp = () => useState('useIsApp', () => false)


// audio player globals
const currentEpisodeObj = null
/**
 * Global state for the current episode object. 
 */
export const useCurrentEpisode = () => useState('useCurrentEpisode', () => currentEpisodeObj)

/**
 * Global state for the current episode total duration in seconds. 
 */
export const useCurrentEpisodeDuration = () => useState('useCurrentEpisodeDuration', () => 0)
/**
 * Global state for the current episode progress in seconds. 
 */
export const useCurrentEpisodeProgress = () => useState('useCurrentEpisodeProgress', () => 0)

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

const isStreamLoading = false
/**
 * Global state for the current Howler stream loading.
 */
export const useIsStreamLoading = () => useState('useIsStreamLoading', () => isStreamLoading)

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

const skipAheadTrigger = false
/**
 * Global state to trigger the skip ahead.
 */
export const useSkipAheadTrigger = () => useState('useSkipAheadTrigger', () => skipAheadTrigger)

const skipBackTrigger = false
/**
 * Global state to trigger the skip back.
 */
export const useSkipBackTrigger = () => useState('useSkipBackTrigger', () => skipBackTrigger)

/**
 * Global var for the height of the audio player
 */
export const audioPlayerHeight = 60

const currentStreamStation = 'wnyc-fm939'
/**
 * Global state for the current streaming station / initial selection in the stream switcher dropdown. 
 */
export const useCurrentStreamStation = () => useState('useCurrentStreamStation', () => currentStreamStation)


const navigationObj = null
/**
 * Global state for the navigation
 */
export const useNavigation = () => useState('navigation', () => navigationObj)


const appDirectory = "wnyc-downloads"
/**
 * Global state for the app directory location
 */
export const useAppDirectory = () => useState('appDirectory', () => appDirectory)

const fileSystem = []
/**
 * Global state for the fileSystem
 */
export const useFileSystem = () => useState('fileSystem', () => fileSystem)

// Local Storage version of the fileSystem
// import { Preferences } from '@capacitor/preferences';
// const fileSystemLS: any = await Preferences.get({ key: 'files' })
// export const useFileSystemLS = () => useState('fileSystemLS', () => JSON.parse(fileSystemLS.value) || [])
export const useFileSystemLS = () => useState('fileSystemLS', () => [])


const bottomMenuState: object = {}
/**
 * Global state for the bottom navigation
 */
export const useBottomMenuState = () => useState('bottomMenuState', () => bottomMenuState)



const textSizeOptionsArr = [
    { label: 'Normal', value: 'Normal', pixel: '16px' },
    { label: 'Large', value: 'Large', pixel: '18px' },
    { label: 'Extra Large', value: 'Extra Large', pixel: '20px' },
]
/**
 * Global state for TEMP login state
 */
export const useTextSizeOption = () => useState('textSizeOption', () => textSizeOptionsArr)


/**
 * Global state for all the shows data
 */
export const useAllShows = () => useState('allShows', () => null)



