// Import the base menu structure directly
import { allMenuData } from './navigationData'
import { mediaTypeRoutes, FALLBACKIMAGEEP } from './globals'
import {
    useIsApp,
    useAppDownloadLink,
} from "~/composables/states"

// Fetching guard to prevent concurrent fetches (thundering herd)
let isFetching = false
let fetchPromise: Promise<void> | null = null

// strip https://www.wnyc.org from the url for local routes
const stripWNYCUrl = (url) => {
    if (url) {
        const strippedUrl = url.replace('https://www.wnyc.org', '')
        return strippedUrl
    }
    return url
}

// strip https://www.wnyc.org/browse/shows/ from the url for local routes
export const stripShowUrl = (url) => {
    if (url) {
        const strippedUrl = url.replace('https://www.wnyc.org/browse/shows/', '')
        return strippedUrl
    }
    return url
}

// Helper function to resolve URL functions in navigation items
const resolveUrlFunctions = (items, appDownloadLink = '') => {
    return items.map(item => {
        const newItem = { ...item }

        // Resolve URL if it's a function
        if (typeof newItem.url === 'function') {
            newItem.url = newItem.url()
        }

        // Replace app download link placeholder
        if (newItem.url === '__USE_APP_DOWNLOAD_LINK__') {
            newItem.url = appDownloadLink || '/mobile'
        }

        // Replace logout command placeholder with actual function (client-side only)
        if (import.meta.client && newItem.command === '__LOGOUT_COMMAND__') {
            // Lazy load the logout function only on client side
            newItem.command = async () => {
                const { logOutUser } = await import('~/utilities/helpers')
                await logOutUser()
            }
        } else if (newItem.command === '__LOGOUT_COMMAND__') {
            // On server, remove the command to avoid serialization issues
            delete newItem.command
        }

        // Recursively resolve URLs in sub-items
        if (newItem.items && Array.isArray(newItem.items)) {
            newItem.items = newItem.items.map(subItemArray =>
                Array.isArray(subItemArray) ? resolveUrlFunctions(subItemArray, appDownloadLink) : subItemArray
            )
        }

        return newItem
    })
}

//normalize for menu function for Wagtail menu data
const normalizeWagtailMenuData = (menuData = []) => {

    return menuData.map((item) => ({
        label: item.value.title,
        url: stripWNYCUrl(item.value.url),
        icon: '',
        id: String(item.id),
        type: item.type,
        hasSubmenu: false,
        inHeaderMenu: true,
    }))
}

// normalize for menu function for station data
const normalizeStationsMenuData = (menuData = []) => {
    return menuData.map((item) => ({
        label: item.station,
        url: `/live?slug=${item.slug}`,
        icon: '',
        image: item.stationImage ? item.stationImage : item.image,
        id: String(item.id),
        type: item.cmsSource,
        hasSubmenu: false,
    }))
}

// normalize for menu function for shows data
const normalizeShowsMenuData = (menuData, limit) => {
    if (!menuData?.featuredShowsInMenu) return []
    return menuData.featuredShowsInMenu.slice(0, limit).map((item) => ({
        label: item.title,
        url: `${mediaTypeRoutes.show}${item.slug}`,
        icon: '',
        image: item.image ?? FALLBACKIMAGEEP,
        id: String(item.id),
        type: item.cmsSource,
        hasSubmenu: false,
    }))
}

// Normalize wagtail shows array -> { featuredShowsInMenu: [...] }
function normalizeShowsResponseForMenu (shows: any[] | null) {
    if (!shows) return null
    const normalized = shows.map((show: any) => ({
        id: show.id,
        title: show.title,
        image: show.image?.id ?? show.image,
        type: show.content_type,
        slug: show.url.split('/').filter(Boolean).pop(),
        cmsSource: show.content_type
    }))
    return { featuredShowsInMenu: normalized }
}

/**
 * Fetch navigation data directly from external APIs (for app/static mode)
 * This replicates the server API logic for Capacitor builds
 */
async function fetchNavigationDataDirect () {
    const config = useRuntimeConfig()
    const API_TIMEOUT = 5000

    try {
        const [wagtail, donate, stations, shows] = await Promise.allSettled([
            $fetch(config.public.HEADER_NAVIGATION_API as string, {
                headers: {
                    'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
                },
                timeout: API_TIMEOUT
            }),
            $fetch(config.public.SYSTEM_MESSAGES_API as string, {
                headers: {
                    'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
                },
                timeout: API_TIMEOUT
            }),
            $fetch(`${config.public.BFF_URL}/api/streams`, {
                timeout: API_TIMEOUT
            }),
            $fetch(`${config.public.AVIARY_BASE_API}curated_lists/20/`, {
                timeout: API_TIMEOUT
            }),
        ])

        return {
            data: {
                wagtailResponse: wagtail.status === 'fulfilled' ? wagtail.value : null,
                donateResponse: donate.status === 'fulfilled' ? donate.value : null,
                stationsResponse: stations.status === 'fulfilled' ? stations.value : null,
                showsResponse: shows.status === 'fulfilled' ? normalizeShowsResponseForMenu(shows.value.list_items) : null,
            }
        }
    } catch (fetchError) {
        console.error("Failed to fetch navigation data directly:", fetchError)
        // Send error to Sentry
        if (import.meta.client) {
            const { $sentry } = useNuxtApp()
            $sentry?.captureException(fetchError, {
                contexts: {
                    fetchContext: {
                        function: 'fetchNavigationDataDirect',
                        apis: ['HEADER_NAVIGATION_API', 'SYSTEM_MESSAGES_API', 'BFF_URL', 'AVIARY_BASE_API']
                    }
                }
            })
        }
        return {
            data: {
                wagtailResponse: null,
                donateResponse: null,
                stationsResponse: null,
                showsResponse: null,
            }
        }
    }
}

/**
 * Fetches and manages navigation data for the application.
 * 
 * This composable retrieves navigation menu data from the API and normalizes it for use
 * throughout the application. It handles data for header navigation, footer navigation,
 * and donate button content. Implements a fetching guard to prevent concurrent requests
 * and supports both server-side and client-side rendering.
 * 
 * @returns {Promise<Object>} An object containing:
 *   - headerNavigationData: Navigation items for the header menu
 *   - allNavigationData: Complete navigation data structure
 *   - footerNavigationData: Navigation items for the footer
 *   - footerLegalLinksData: Legal links for the footer
 *   - donateButtonData: Donate button text and link
 *   - status: Fetch status ('idle', 'pending', 'success', or 'error')
 *   - error: Any error that occurred during fetching
 */
export default async function useNavigationData () {

    // Define shared state (always run this to ensure state is available on both server and client)
    const headerNavigationData = useState("headerNavigationData", () => [])
    const allNavigationData = useState("allNavigationData", () => [])
    const footerNavigationData = useState("footerNavigationData", () => [])
    const footerLegalLinksData = useState("footerLegalLinksData", () => [])
    const donateButtonData = useState<{ buttonText: string, buttonLink: string }>("donateButtonData", () => ({
        buttonText: '',
        buttonLink: ''
    }))
    const fetchStatus = useState("navigationFetchStatus", () => 'idle')
    const fetchError = useState("navigationFetchError", () => null)

    // Get app download link outside conditional to ensure Nuxt context is available
    const appDownloadLink = useAppDownloadLink()
    const isApp = useIsApp()

    // Only fetch if we don't have data yet and not currently fetching
    if (headerNavigationData.value.length === 0) {
        // If already fetching, wait for that fetch to complete (prevents thundering herd)
        if (isFetching && fetchPromise) {
            try {
                // Add timeout to prevent waiting forever
                await Promise.race([
                    fetchPromise,
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Navigation fetch timeout')), 10000))
                ])
            } catch (err) {
                // Timeout occurred, proceed with empty navigation
                if (import.meta.client) {
                    const { $sentry } = useNuxtApp()
                    $sentry?.captureException(err, {
                        contexts: {
                            fetchContext: {
                                function: 'useNavigationData',
                                mode: import.meta.env.SSR ? 'ssr' : 'client',
                                isApp: isApp.value
                            }
                        }
                    })
                }
            }
        } else if (!isFetching) {
            // Start fetch and set guard
            isFetching = true
            fetchPromise = (async () => {
                try {
                    let nData, error, status

                    if (import.meta.server) {
                        // Server-side: use $fetch to avoid HTTP requests (prevents circular dependencies during SSR/health checks)
                        try {
                            const serverData = await $fetch('/api/navigation')
                            nData = { value: serverData }
                            error = { value: null }
                            status = { value: 'success' }
                        } catch (err) {
                            nData = { value: null }
                            error = { value: err }
                            status = { value: 'error' }
                        }
                    } else if (isApp.value) {
                        // App mode (Capacitor): fetch directly from external APIs (no server endpoint available)
                        try {
                            const directData = await fetchNavigationDataDirect()
                            nData = { value: directData }
                            error = { value: null }
                            status = { value: 'success' }
                        } catch (err) {
                            nData = { value: null }
                            error = { value: err }
                            status = { value: 'error' }
                        }
                    } else {
                        // Client-side web mode: use useFetch for proper hydration
                        const result = await useFetch('/api/navigation', {
                            key: 'global-navigation-data',
                        })
                        nData = result.data
                        error = result.error
                        status = result.status
                    }

                    fetchStatus.value = status.value
                    fetchError.value = error.value

                    // Check if there was a fetch error
                    if (error.value) {
                        throw new Error(`Navigation fetch failed: ${JSON.stringify(error.value)}`)
                    }

                    // Check if data is available before accessing nested properties
                    if (!nData.value) {
                        throw new Error('Navigation response is null')
                    }

                    if (!nData.value.data) {
                        throw new Error('Navigation data property is missing')
                    }

                    const bffData = nData.value.data

                    // IMPORTANT: Create a deep clone to avoid modifying the imported `allMenuData` object directly.
                    let workingHeaderNav = resolveUrlFunctions(allMenuData.map(item => ({ ...item })), appDownloadLink.value)
                    // Normalize and merge Stations
                    const stationsItems = normalizeStationsMenuData(bffData.stationsResponse)
                    if (workingHeaderNav[0]?.items?.[0]) {
                        workingHeaderNav[0].items[0].splice(0, 0, ...stationsItems)
                    }

                    // Normalize and merge Shows
                    const showsItems = normalizeShowsMenuData(bffData.showsResponse, 5)
                    if (workingHeaderNav[1]?.items?.[0]) {
                        workingHeaderNav[1].items[0].splice(0, 0, ...showsItems)
                    }

                    // Create the 'allNavigationData' state *before* header-specific modifications
                    // Clone again to ensure 'allNav' is independent from further 'workingHeaderNav' changes
                    const workingAllNav = resolveUrlFunctions(workingHeaderNav.map(item => ({ ...item })), appDownloadLink.value)
                    // Normalize and merge Wagtail Primary Navigation
                    const primaryNavItems = normalizeWagtailMenuData(bffData.wagtailResponse?.primary_navigation)
                    workingHeaderNav.splice(2, 0, ...primaryNavItems)

                    const collectionsMenuItem = workingAllNav.find((item) => item.label === "Collections")
                    if (collectionsMenuItem?.items) {
                        collectionsMenuItem.items[0] = primaryNavItems
                    }

                    const legalLinkItems = normalizeWagtailMenuData(bffData.wagtailResponse?.legal_links)

                    workingHeaderNav = workingHeaderNav.filter((item) => item.inHeaderMenu !== false)

                    const donateButtonLabel = isApp.value ? "WNYC App Donate Button" : "WNYC Donate Button"
                    const donateBanner = bffData.donateResponse?.product_banners?.find(
                        (banner) => banner.value.title === donateButtonLabel
                    )

                    const finalDonateData = { buttonText: '', buttonLink: '' }
                    if (donateBanner) {
                        finalDonateData.buttonText = donateBanner.value.button_text
                        finalDonateData.buttonLink = donateBanner.value.button_link
                    }
                    const footerNavItems = workingAllNav.filter((item) => item.inFooterMenu !== false)

                    // Update shared state
                    headerNavigationData.value = workingHeaderNav
                    allNavigationData.value = workingAllNav
                    footerNavigationData.value = footerNavItems
                    footerLegalLinksData.value = legalLinkItems
                    donateButtonData.value = finalDonateData

                } catch (fetchError) {
                    console.error("Failed to fetch or process navigation data:", fetchError)
                    // Send error to Sentry
                    if (import.meta.client) {
                        const { $sentry } = useNuxtApp()
                        $sentry?.captureException(fetchError, {
                            contexts: {
                                navigationContext: {
                                    function: 'useNavigationData',
                                    mode: import.meta.env.SSR ? 'ssr' : 'client',
                                    isApp: isApp.value
                                }
                            }
                        })
                    }
                    headerNavigationData.value = []
                    allNavigationData.value = []
                    footerNavigationData.value = []
                    footerLegalLinksData.value = []
                    donateButtonData.value = { buttonText: '', buttonLink: '' }
                } finally {
                    // Reset fetching guard
                    isFetching = false
                }
            })()

            // Wait for the fetch to complete
            await fetchPromise
        }
    }

    // Return the shared state and status
    return {
        headerNavigationData,
        allNavigationData,
        footerNavigationData,
        footerLegalLinksData,
        donateButtonData,
        status: fetchStatus,
        error: fetchError
    }
}