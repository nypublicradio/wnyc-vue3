// Import the base menu structure directly
import { allMenuData } from './navigationData'
import { mediaTypeRoutes, FALLBACKIMAGEEP } from './globals'
import {
    useIsApp,
    useAppDownloadLink,
} from "~/composables/states"
// Shared state variables (singleton pattern)
let isInitialized = false
let headerNavigationData = null
let allNavigationData = null
let footerNavigationData = null
let footerLegalLinksData = null
let donateButtonData = null
let fetchStatus = null
let fetchError = null

// strip https://www.wnyc.org from the url for local routes
const stripWNYCUrl = (url) => {
    if (url) {
        const strippedUrl = url.replace('https://www.wnyc.org', '')
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

export default async function useNavigationData () {
    // Initialize shared state only once
    if (!isInitialized) {
        isInitialized = true

        const config = useRuntimeConfig()

        // Define shared state (singleton)
        headerNavigationData = useState("headerNavigationData", () => [])
        allNavigationData = useState("allNavigationData", () => [])
        footerNavigationData = useState("footerNavigationData", () => [])
        footerLegalLinksData = useState("footerLegalLinksData", () => [])
        donateButtonData = useState<{ buttonText: string, buttonLink: string }>("donateButtonData", () => ({
            buttonText: '',
            buttonLink: ''
        }))

        try {
            // BFF
            const { data: nData, error, status } = await useFetch(`${config.public.BFF_URL}/api/navigation`)
            fetchStatus = status
            fetchError = error

            // Check if there was a fetch error
            if (error.value) {
                throw new Error(`Navigation fetch failed: ${error.value.message || error.value}`)
            }

            // Check if data is available before accessing nested properties
            if (!nData.value || !nData.value.data) {
                throw new Error('Navigation data is null or missing data property')
            }

            const bffData = nData.value.data

            // Get app download link for navigation
            const appDownloadLink = useAppDownloadLink()

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

            const isApp = useIsApp()
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
            headerNavigationData.value = []
            allNavigationData.value = []
            footerNavigationData.value = []
            footerLegalLinksData.value = []
            donateButtonData.value = { buttonText: '', buttonLink: '' }
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
