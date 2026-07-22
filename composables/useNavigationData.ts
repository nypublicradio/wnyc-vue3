// Import the base menu structure directly
import { computed } from 'vue'
import { useAsyncData, useNuxtApp, useRuntimeConfig } from '#app'
import { allMenuData } from './navigationData'
import { mediaTypeRoutes, FALLBACKIMAGEEP } from './globals'
import {
    useIsApp,
    useAppDownloadLink,
} from "~/composables/states"
import { getYear } from '~/utilities/helpers'

// strip any wnyc.org domain from the url for local routes
// but preserve URLs with subdomains (e.g. sponsorship.wnyc.org)
const stripWNYCUrl = (url) => {
    if (url) {
        if (/https?:\/\/(?!www\.)[a-zA-Z0-9-]+\.wnyc\.org/i.test(url)) {
            return url
        }
        return url.replace(/https?:\/\/(?:www\.)?wnyc\.org/i, '')
    }
    return url
}

// strip https://www.wnyc.org/browse/shows/ from the url for local routes
export const stripShowUrl = (url) => {
    if (url) {
        return url.replace('https://www.wnyc.org/browse/shows/', '')
    }
    return url
}

// Helper function to resolve URL functions in navigation items
const resolveUrlFunctions = (items, appDownloadLink = '') => {
    return items.map(item => {
        const newItem = { ...item }

        if (typeof newItem.url === 'function') {
            newItem.url = newItem.url()
        }

        if (newItem.url === '__USE_APP_DOWNLOAD_LINK__') {
            newItem.url = appDownloadLink || '/mobile'
        }

        // Replace logout command placeholder with actual function (client-side only)
        if (import.meta.client && newItem.command === '__LOGOUT_COMMAND__') {
            newItem.command = async () => {
                const { logOutUser } = await import('~/utilities/helpers')
                await logOutUser()
            }
        } else if (newItem.command === '__LOGOUT_COMMAND__') {
            delete newItem.command
        }

        if (newItem.items && Array.isArray(newItem.items)) {
            newItem.items = newItem.items.map(subItemArray =>
                Array.isArray(subItemArray) ? resolveUrlFunctions(subItemArray, appDownloadLink) : subItemArray
            )
        }

        return newItem
    })
}
// Helper functions to normalize BFF navigation data into the expected format
const normalizeWagtailMenuData = (menuData = []) => {
    if (!menuData || !Array.isArray(menuData)) return []
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
// Helper functions to normalize BFF navigation data into the expected format
const normalizeStationsMenuData = (menuData = []) => {
    if (!menuData || !Array.isArray(menuData)) return []
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
// Helper functions to normalize BFF navigation data into the expected format
const normalizeShowsMenuData = (menuData, limit) => {
    if (!menuData || !menuData.featuredShowsInMenu || !Array.isArray(menuData.featuredShowsInMenu)) return []
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

/**
 * Processes raw BFF navigation response into the various navigation views.
 */
function processNavigationData (bffData, appDownloadLink: string, isApp: boolean) {
    // Clone allMenuData and resolve URL functions
    let workingHeaderNav = resolveUrlFunctions(allMenuData.map(item => ({ ...item })), appDownloadLink)

    // Merge Stations into first menu item
    const stationsItems = normalizeStationsMenuData(bffData.stationsResponse)
    if (workingHeaderNav[0]?.items?.[0]) {
        workingHeaderNav[0].items[0].splice(0, 0, ...stationsItems)
    }

    // Merge Shows into third menu item
    const showsItems = normalizeShowsMenuData(bffData.showsResponse, 5)
    if (workingHeaderNav[2]?.items?.[0]) {
        workingHeaderNav[2].items[0].splice(0, 0, ...showsItems)
    }

    // Build allNav before header-specific modifications
    const workingAllNav = resolveUrlFunctions(workingHeaderNav.map(item => ({ ...item })), appDownloadLink)

    // Merge Wagtail primary navigation into header
    const primaryNavItems = normalizeWagtailMenuData(bffData.wagtailResponse?.primary_navigation)
    workingHeaderNav.splice(3, 0, ...primaryNavItems)

    // Add primary nav items to Collections in allNav
    const collectionsMenuItem = workingAllNav.find((item) => item.label === "Collections")
    if (collectionsMenuItem?.items) {
        collectionsMenuItem.items[0] = primaryNavItems
    }

    const legalLinkItems = normalizeWagtailMenuData(bffData.wagtailResponse?.legal_links)
    workingHeaderNav = workingHeaderNav.filter((item) => item.inHeaderMenu !== false)

    // Build donate button data with app/web URL variant
    const finalDonateData = { buttonText: '', buttonLink: '' }
    const donateBanner = bffData.donateResponse?.product_banners?.find(
        (banner) => banner.value.title === "WNYC App Donate Button"
    )
    if (donateBanner) {
        let link = donateBanner.value.button_link
        // Normalize to web format first
        link = link.replace('/support/wnyc-app', '/support/wnyc')
            .replace('utm_medium=wnyc-app', 'utm_medium=wnyc')
        // Convert to app format if needed
        if (isApp) {
            link = link.replace('/support/wnyc', '/support/wnyc-app')
                .replace(/utm_medium=[^&]+/, 'utm_medium=wnyc-app')
        }
        finalDonateData.buttonLink = link
        finalDonateData.buttonText = donateBanner.value.button_text
    }

    // copy write year for footer
    console.log('bffData.wagtailResponse', bffData.wagtailResponse)
    const copyrightYear = bffData.wagtailResponse?.copyright_year || getYear()

    // populate Inside WNYC(id:3) menu with Wagtail primary navigation items
    const primaryFooterNavItems = normalizeWagtailMenuData(bffData.wagtailResponse?.primary_footer_links)
    workingAllNav.find((item) => item.id === '3').items[0] = primaryFooterNavItems

    // populate Get Involved(id:4) menu with Wagtail primary secondary items
    const secondaryFooterNavItems = normalizeWagtailMenuData(bffData.wagtailResponse?.secondary_footer_links)
    workingAllNav.find((item) => item.id === '4').items[0] = secondaryFooterNavItems

    return {
        headerNavigationData: workingHeaderNav,
        allNavigationData: workingAllNav,
        footerNavigationData: workingAllNav.filter((item) => item.inFooterMenu !== false),
        footerLegalLinksData: legalLinkItems,
        footerPropertyDescription: bffData.wagtailResponse?.property_description || '',
        donateButtonData: finalDonateData,
        copyrightYear
    }
}

/**
 * Fetches and manages navigation data for the application.
 *
 * Uses useAsyncData for built-in deduplication, SSR payload transfer, and caching.
 */
export default async function useNavigationData () {
    const config = useRuntimeConfig()
    const appDownloadLink = useAppDownloadLink()
    const isApp = useIsApp()

    const { data, status, error } = await useAsyncData('navigationData',
        () => $fetch(`${config.public.BFF_URL}/api/navigation`),
        {
            transform: (response) => {
                if (!response?.data) return null
                return processNavigationData(response.data, appDownloadLink.value, isApp.value)
            }
        }
    )

    // Report errors to Sentry on client
    if (error.value && import.meta.client) {
        const { $sentry } = useNuxtApp()
        $sentry?.captureException(error.value, {
            contexts: {
                navigationContext: {
                    function: 'useNavigationData',
                    isApp: isApp.value
                }
            }
        })
    }

    return {
        headerNavigationData: computed(() => data.value?.headerNavigationData ?? []),
        allNavigationData: computed(() => data.value?.allNavigationData ?? []),
        footerNavigationData: computed(() => data.value?.footerNavigationData ?? []),
        footerLegalLinksData: computed(() => data.value?.footerLegalLinksData ?? []),
        footerPropertyDescription: computed(() => data.value?.footerPropertyDescription ?? ''),
        donateButtonData: computed(() => data.value?.donateButtonData ?? { buttonText: '', buttonLink: '' }),
        copyrightYear: computed(() => data.value?.copyrightYear),
        status,
        error,
    }
}