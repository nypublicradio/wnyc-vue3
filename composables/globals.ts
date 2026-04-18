import { useIsApp } from "./states"
export const localUserProfileKey = 'localUserProfile'

export const cmsSources = {
    PUBLISHER: 'publisher',
    WAGTAIL: 'wagtail',
    NPR: 'npr',
    SIMPLECAST: 'simplecast',
}

export const appMenuOptions = [
    { icon: "HomeIcon", value: "home", slug: "/home" },
    { icon: "LiveIcon", value: "live", slug: "/live" },
    { icon: "BrowseIcon", value: "browse", slug: "/browse" },
    { icon: "StarIcon", value: "saved", slug: "/saved" },
]

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

export const WAGTAILIMAGEDOMAINSOURCES = [
    "nypr.digital/images",
    "gothamist.com/original_images"
]

export const mediaTypes = {
    LIVE: 'live',
    SIMPLECAST: 'simplecast',
    SHOW: 'show',
    EVENT: 'event',
    EPISODE: 'episode',
    FULL: 'full',
    SEGMENT: 'segment',
    STORY: 'story',
    ARTICLE_PAGE: 'article_page',
    ARTICLE: 'article',
    NPR_EPISODE: 'npr_episode',
    NPR_ARTICLE: 'npr_article',
    CARD: 'card',
    STAFF: 'staff',
    PEOPLE: 'people',
}

export const mediaTypeRoutes = {
    [mediaTypes.STAFF]: '/staff/',
    [mediaTypes.PEOPLE]: '/people/',
    [mediaTypes.LIVE]: '/live/',
    [mediaTypes.SHOW]: '/browse/shows/',
    [mediaTypes.EPISODE]: '/browse/shows/episode/',
    [mediaTypes.SEGMENT]: '/browse/shows/episode/',
    [mediaTypes.STORY]: '/story/',
    [mediaTypes.ARTICLE_PAGE]: '/story/',
    [mediaTypes.ARTICLE]: '/story/',
    [mediaTypes.NPR_EPISODE]: '/npr/',
    [mediaTypes.NPR_ARTICLE]: '/npr/',
    [mediaTypes.EVENT]: '/events/',
    [mediaTypes.SIMPLECAST]: '/browse/shows/episode/simplecast/',
    [mediaTypes.CARD]: '',
}

export const FALLBACKIMAGE = '/fallback/wnyc.webp'
export const FALLBACKIMAGEEP = '/fallback/ep.webp'
export const FALLBACKIMAGEEPDARK = '/fallback/ep-dark.webp'
export const FALLBACKIMAGEEPHEAD = '/fallback/ep-head.webp'
export const FALLBACKIMAGEEPHEADDARK = '/fallback/ep-head-dark.webp'
export const FALLBACKUSER = '/fallback/user.webp'
export const FALLBACKUSERDARK = '/fallback/user-dark.webp'

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

//brand cards
export const brandCards = [
    {
        label: 'The New Yorker Radio Hour',
        svg: '/brand-card-images/radio-hour-logo.svg',
        value: 'new-yorker-radio-hour',
        url: `${mediaTypeRoutes[mediaTypes.SHOW]}new-yorker-radio-hour`,
        color: '#DE1E3D',
        image: '/brand-card-images/radio-hour-bg.png',
    },
    {
        label: 'Gothamist',
        svg: '/brand-card-images/gothamist-logo.svg',
        value: 'gothamist',
        url: 'https://gothamist.com',
        color: '#D8D6AF',
        image: '/brand-card-images/gothamist-bg.png',
    },
    {
        label: 'Radiolab',
        svg: '/brand-card-images/radiolab-logo.svg',
        value: 'radiolab',
        url: `${mediaTypeRoutes[mediaTypes.SHOW]}radiolab`,
        color: '#0454D6',
        image: '/brand-card-images/radiolab-bg.png',
    },
    {
        label: 'New Sounds',
        svg: '/brand-card-images/new-sounds-logo.svg',
        value: 'new-sounds',
        url: `${mediaTypeRoutes[mediaTypes.SHOW]}new-sounds`,
        color: '#E788EF',
        image: '/brand-card-images/new-sounds-bg.png',
    },
    {
        label: 'On The Media',
        svg: '/brand-card-images/on-the-media-logo.svg',
        value: 'on-the-media',
        url: `${mediaTypeRoutes[mediaTypes.SHOW]}on-the-media`,
        color: '#DDDDDB',
        image: '/brand-card-images/on-the-media-bg.png',
    },
    {
        label: 'The Greene Space',
        svg: '/brand-card-images/the-greene-space-logo.svg',
        value: 'the-greene-space',
        url: `${mediaTypeRoutes[mediaTypes.EVENT]}`,
        color: '#91BD63',
        image: '/brand-card-images/the-greene-space-bg.png',
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

// member center link
export const memberCenterLink = 'https://pledge.wnyc.org/user/email-link'
