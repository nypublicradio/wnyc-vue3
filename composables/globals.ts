import { useIsApp } from "./states"


export const localUserProfileKey = 'localUserProfile'

export const cmsSources = {
    PUBLISHER: 'publisher',
    WAGTAIL: 'wagtail',
    NPR: 'npr',
    SIMPLECAST: 'simplecast',
}

export const NPRIMAGEDOMAINSOURCES = ["media.npr.org", "npr.brightspotcdn.com"]

export const mediaTypes = {
    LIVE: 'live',
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
        label: 'Arts & Culture',
        value: 'arts-and-culture',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-arts&api_key=culture',
        color: 'var(--teal-lake)',
    },
    {
        label: 'News',
        value: 'news',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-news&api_key=atc',
        color: 'var(--red)',
    },
    {
        label: 'Politics',
        value: 'politics',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-politics&api_key=poli',
        color: 'var(--electric-violet)',
    },
    {
        label: 'Tech & Media',
        value: 'tech-and-media',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-techmedia&api_key=otm',
        color: 'var(--honolulu-blue)',
    },
    {
        label: 'Storytelling',
        value: 'storytelling',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-storytelling&api_key=story',
        color: 'var(--berry)',
    },
    {
        label: 'Science',
        value: 'science',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-science&api_key=atom',
        color: 'var(--spanish-orange)',
    },
    {
        label: 'Music',
        value: 'music',
        url: 'https://www.wnyc.org/api/v2/discover/shows/?discover_station=wnyc-vue3-app-music&api_key=csharp',
        color: 'var(--sea-green',
    },
]

//saved menu
export const getSavedMenuItems = () => {
    const isApp = useIsApp()
    return [
        {
            label: 'Followed Shows',
            value: 'FollowedShows',
            color: 'var(--red)',
        },
        {
            label: 'Favorites',
            value: 'Favorites',
            color: 'var(--red)',
        },
        // Conditionally add the Downloads entry if isApp is true
        ...(isApp.value ? [{
            label: 'Downloads',
            value: 'Downloads',
            color: 'var(--red)',
        }] : []),
        {
            label: 'History',
            value: 'History',
            color: 'var(--red)',
        },
    ]
}



// const imageShape = {
//     alt: "A choreographer working with dancers in a studio",
//     caption: "Alexei Ratmansky, center, rehearsing with American Ballet Theatre dancers.",
//     collection: 1,
//     created_at: "2022-07-13T11:30:39.745683-04:00",
//     credit: "Rosalie O'Connor/American Ballet Theatre",
//     creditLink: "",
//     expiryDate: null,
//     file: "https://cdn.cms.prod.nypr.digital/original_images/Ratmansky_splash.jpg",
//     template: "https://media.wnyc.org/i/%s/%s/%s/%s/2023/09/philmurphy.jpg",
//     fileHash: "e660e2855473fa54fb7c3959a1d9510323df3c07",
//     file_size: 341654,
//     focalPointHeight: null,
//     focalPointWidth: null,
//     focalPointX: null,
//     focalPointY: null,
//     height: 650,
//     id: 332655,
//     source: {
//         name: "AP Images",
//         url: "",
//     },
//     title: "Ratmansky_splash.jpg",
//     type: "aviary/publisher/other",
//     uploadedByUser: 127,
//     usageLimitations: "",
//     width: 900,
// }
