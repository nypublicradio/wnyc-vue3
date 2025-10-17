import { useIsApp } from "./states"
import HomeIcon from "~/components/icons/HomeIcon.vue"
import LiveIcon from "~/components/icons/LiveIcon.vue"
import BrowseIcon from "~/components/icons/BrowseIcon.vue"
import StarIcon from "~/components/icons/StarIcon.vue"

export const localUserProfileKey = 'localUserProfile'

export const cmsSources = {
    PUBLISHER: 'publisher',
    WAGTAIL: 'wagtail',
    NPR: 'npr',
    SIMPLECAST: 'simplecast',
}

export const appMenuOptions = ref([
    { icon: markRaw(HomeIcon), value: "home", slug: "/home" },
    { icon: markRaw(LiveIcon), value: "live", slug: "/live" },
    { icon: markRaw(BrowseIcon), value: "browse", slug: "/browse" },
    { icon: markRaw(StarIcon), value: "saved", slug: "/saved" },
])

export const liveStationPreferences = [
    {
        slug: 'wnyc-fm939',
        station: 'WNYC 93.9 FM',
        label: 'WNYC',
    },
    {
        slug: 'wqxr',
        station: 'WQXR 105.9 FM',
        label: 'WQXR',
    },
    {
        slug: 'q2',
        station: 'New Sounds',
        label: 'New Sounds',
    },
    {
        slug: 'wqxr-holiday-channel-on-wnyc',
        station: 'WQXR Holiday Channel',
        label: 'WQXR Holiday Channel',
    },

]

export const NPRIMAGEDOMAINSOURCES = ["media.npr.org", "npr.brightspotcdn.com"]

export const mediaTypes = {
    LIVE: 'live',
    SIMPLECAST: 'simplecast',
    SHOW: 'show',
    EPISODE: 'episode',
    SEGMENT: 'segment',
    STORY: 'story',
    ARTICLE_PAGE: 'article_page',
    ARTICLE: 'article',
    NPR_EPISODE: 'npr_episode',
    NPR_ARTICLE: 'npr_article',
}

export const mediaTypeRoutes = {
    [mediaTypes.LIVE]: '/live/',
    [mediaTypes.SHOW]: '/browse/shows/',
    [mediaTypes.EPISODE]: '/browse/shows/episode/',
    [mediaTypes.SEGMENT]: '/browse/shows/episode/',
    [mediaTypes.STORY]: '/story/',
    [mediaTypes.ARTICLE_PAGE]: '/story/',
    [mediaTypes.ARTICLE]: '/story/',
    [mediaTypes.NPR_EPISODE]: '/npr/',
    [mediaTypes.NPR_ARTICLE]: '/npr/',
}

export const FALLBACKIMAGE = 'https://media.wnyc.org/i/%s/%s/%s/%s/1/wnyc_square_logo.png'
export const FALLBACKIMAGEWAGTAIL = '342941'
export const FALLBACKIMAGELOCAL = '342941'
export const FALLBACKIMAGEEP = '343750'
export const FALLBACKIMAGEEPDARK = '344059'
export const FALLBACKIMAGEEPHEAD = '343751'
export const FALLBACKIMAGEEPHEADDARK = '344060'
export const FALLBACKUSER = '344344'
export const FALLBACKUSERDARK = '344343'

//Global vars for the browser top color
export const useBrowserTopColor = () => useState('browserTopColor', () => '#ffffff')
//Global vars for the browser top color or Darkmode
export const useBrowserTopColorDarkMode = () => useState('browserTopColorDarkMode', () => '#1f2741')

//player skip time
export const PLAYER_SKIP_TIME = 10

//browse topics
export const showTopics = [
    {
        label: 'Arts',
        value: 'arts-and-culture',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-arts&api_key=culture',
        color: 'var(--teal-lake)',
        image: '/topics-btn-images/arts.jpg',
    },
    {
        label: 'Local News',
        value: 'news',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-news&api_key=atc',
        color: 'var(--p-primary-color)',
        image: '/topics-btn-images/news.jpg',
    },
    {
        label: 'Politics',
        value: 'politics',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-politics&api_key=poli',
        color: 'var(--electric-violet)',
        image: '/topics-btn-images/politics.jpg',
    },
    {
        label: 'Technology',
        value: 'tech-and-media',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-techmedia&api_key=otm',
        color: 'var(--honolulu-blue)',
        image: '/topics-btn-images/technology.jpg',
    },
    {
        label: 'Storytelling',
        value: 'storytelling',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-storytelling&api_key=story',
        color: 'var(--berry)',
        image: '/topics-btn-images/storytelling.jpg',
    },
    {
        label: 'Science',
        value: 'science',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-science&api_key=atom',
        color: 'var(--spanish-orange)',
        image: '/topics-btn-images/science.jpg',
    },
    {
        label: 'Music',
        value: 'music',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-music&api_key=csharp',
        color: 'var(--sea-green)',
        image: '/topics-btn-images/music.jpg',
    },
]

//saved menu
export const getSavedMenuItems = () => {
    const isApp = useIsApp()
    return [
        {
            label: 'Followed Shows',
            value: 'FollowedShows',
            color: 'var(--p-primary-500)',
        },
        {
            label: 'Favorites',
            value: 'Favorites',
            color: 'var(--p-primary-500)',
        },
        // Conditionally add the Downloads entry if isApp is true
        ...(isApp.value ? [{
            label: 'Downloads',
            value: 'Downloads',
            color: 'var(--p-primary-500)',
        }] : []),
        {
            label: 'History',
            value: 'History',
            color: 'var(--p-primary-500)',
        },
    ]
}
