// Homepage data
// // global state for the Bff useHomepageData data
// export const useHomepageData = () => useState('useHomepageData', () => null)

// default settings that are overwritten by user data
const localUserProfileDefault: object = {
    autodownload: false,
    default_live_stream: 'WNYC 93.9 FM',
    receive_general_notifications: false,
    text_size: 'Normal',
    dark_mode: false,
    sleep_timer: 90,
}
/**
 * Global state for the settings data
 */
export const useLocalUserProfileDefault = () => useState('localUserProfileDefault', () => localUserProfileDefault)

// keep track of dark mode
export const useIsDarkMode = () => useState('useIsDarkMode', () => false)

const currentUser = null
// global state for the current authorized user
export const useCurrentUser = () => useState('useCurrentUser', () => currentUser)

const currentUserFavorites = null

// global state for the current authorized user's profile
export const useCurrentUserFavorites = () => useState('useCurrentUserFavorites', () => currentUserFavorites)

const currentUserProfile = null

// global state for the current authorized user's profile
export const useCurrentUserProfile = () => useState('useCurrentUserProfile', () => currentUserProfile)

// setting sidebar state
export const useSettingSideBar = () => useState('useSettingSideBar', () => false)

// login sidebar state
export const useLoginSideBar = () => useState('useLoginSideBar', () => false)

// signin sidebar state
export const useSignupSideBar = () => useState('useSignupSideBar', () => false)

// sleep timer sidebar state
export const useSleepTimerSideBar = () => useState("useSleepTimerSideBar", () => false)

// sleep timer currentTime state
export const useSleepTimerInterval = () => useState("useSleepTimerInterval", () => null)

// sleep timer currentTime state
export const useSleepTimerCurrentTime = () =>
    useState("useSleepTimerCurrentTime", () => 1800)

// sleep timer selected state
export const useSleepTimerSelectedTime = () =>
    useState("useSleepTimerSelectedTime", () => ({ label: "30 minutes", value: 1800 }));

// sleep timer running state
export const useSleepTimerRunning = () => useState("useSleepTimerRunning", () => false)

// sleep timer running state
export const useSleepTimerPaused = () => useState("useSleepTimerPaused", () => false)

// signin sidebar state
export const useForgotPasswordSideBar = () => useState('useForgotPasswordSideBar', () => false)

// edit profile sidebar state
export const useEditProfileSideBar = () => useState('useEditProfileSideBar', () => false)

// create an account or log in bottom sidebar state
export const useAccountPromptSideBar = () => useState('useAccountPromptSideBar', () => false)

// delete an account sidebar state
export const useAccountDeleteSideBar = () => useState('useAccountDeleteSideBar', () => false)

// global state for the network connection
export const useIsNetworkConnected = () => useState('useIsNetworkConnected', () => true)


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
 * Global state for the current audio sound playing.
 */
export const useIsEpisodePlaying = () => useState('useIsEpisodePlaying', () => isEpisodePlaying)

const isStreamLoading = false
/**
 * Global state for the current audio stream loading.
 */
export const useIsStreamLoading = () => useState('useIsStreamLoading', () => isStreamLoading)

/**
 * Global state for the current audio file is a live stream or not.
 */
export const useIsLiveStream = () => useState('useIsLiveStream', () => null)

/**
 * Global state for the player expanded.
 */
export const useIsPlayerExpanded = () => useState('useIsPlayerExpanded', () => false)

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


const playerSeek = { bool: false, time: 20 }
/**
 * Global state to trigger the skip back.
 */
export const usePlayerSeek = () => useState('usePlayerSeek', (bool, time) => playerSeek)

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

// story
export const useSensitiveContent = () => useState<boolean>('sensitiveContent', () => false)

// global toast
export const useGlobalToast = () => useState<object>('globalToast', () => null)

// saved page tab state
export const useSelectedSavedTab = () => useState<number>('useSelectedSavedTab', () => 0)

// store Device Id
export const useDeviceId = () => useState<string>('useDeviceId', () => null)

// track if it's the initial play or not
export const useIsInitialPlay = () => useState<boolean>('useIsInitialPlay', () => true)