import { flashOff } from "ionicons/icons"

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








/**
 * NEW STUFF
 */


const bottomMenuState: object = {}
/**
 * Global state for the bottom navigation
 */
export const useBottomMenuState = () => useState('bottomMenuState', () => bottomMenuState)



// TODO: ionitially populate from Supabase
const settingsData: object = {
    name: 'Peter Gibbons',
    // profileimage: 'https://media.licdn.com/dms/image/C5603AQHqyqn8BBa6Wg/profile-displayphoto-shrink_800_800/0/1517520876017?e=2147483647&v=beta&t=bbkZ9w4zWWPXI6FsKD3Ml41uIZnB_b49qHYzALH4SKo',
    profileimage: null,
    email: 'peter.gibbons@initech.com',
    password: '12345678',
    autodownload: false,
    defaultstream: 'WNYC 93.9 FM',
    notificationgeneral: true,
    textsize: 'Normal',
    darktheme: false,
}
/**
 * Global state for the settings data
 */
export const useSettingsData = () => useState('settingsData', () => settingsData)

/**
 * Global state for TEMP login state
 */
export const useLoggedState = () => useState('loggedState', () => false)


const textSizeOptionsObj = [
    { label: 'Normal', value: 'Normal', pixel: '16px' },
    { label: 'Large', value: 'Large', pixel: '18px' },
    { label: 'Extra Large', value: 'Extra Large', pixel: '20px' },
]
/**
 * Global state for TEMP login state
 */
export const useTextSizeOption = () => useState('textSizeOption', () => textSizeOptionsObj)