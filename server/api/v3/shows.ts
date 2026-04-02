import axios from "axios"
import humps from "humps"
import { normalizeWagtailShow } from '~/composables/data/shows'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

/**
 * Fetches shows from the Wagtail CMS API
 * @returns Promise that resolves to an object containing shows array and metadata
 */
export const getShows = async () => {
    const config = __getConfig()

    try {
        const options = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/`,
            params: {
                type: 'shows.ShowPage',
                show_on_index_listing: true,
                fields: 'show_art,show_logo',
                //fields: 'description,topper_display_title,linked_data_source,show_art,show_logo,topper_background,body,about_module,can_download_episodes,can_embed_episodes,in_page_navigation',
                order: 'title',
            },
            headers: {
                'X-CMS-Site': config.public.cmsSite ?? 'demo.wnyc.org:443',
            },
            timeout: 15000, // 15 second timeout
        }

        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)
        // Normalize each show item
        const shows = (resData.items || []).map(normalizeWagtailShow)

        return shows
    } catch (e: any) {
        console.error('Error fetching shows:', {
            message: e?.message,
            code: e?.code,
            status: e?.response?.status,
            url: `${config.public.AVIARY_BASE_API}pages/`
        })
        return []
    }
}

/**
 * Fetches featured shows from a curated list page in Wagtail
 * @param allShows - Array of all shows to filter from
 * @returns Promise that resolves to an array of featured shows
 */
export const getFeaturedShows = async (allShows: ReturnType<typeof normalizeWagtailShow>[]) => {
    const config = __getConfig()
    // If no page ID is configured, return empty array
    if (!config.featuredShowsPageId) {
        return []
    }

    try {
        // Fetch the curated list directly
        const options = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}curated_lists/${config.featuredShowsPageId}`,
            headers: {
                'X-CMS-Site': config.public.cmsSite ?? 'demo.wnyc.org:443'
            },
            timeout: 10000, // 10 second timeout
        }

        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)

        // Extract shows from list items by matching slugs
        const featuredShows: ReturnType<typeof normalizeWagtailShow>[] = []

        if (resData.listItems && Array.isArray(resData.listItems)) {
            // Create a map of shows by slug for efficient lookup
            const showsBySlug = new Map(allShows.map(show => [show.slug, show]))

            // Process each list item to find matching shows
            for (const item of resData.listItems) {
                if (item.url) {
                    // Extract slug from URL (e.g., "https://demo.wnyc.org/shows/brian-lehrer-show/" -> "brian-lehrer-show")
                    const urlMatch = item.url.match(/\/shows\/([^/]+)\/?$/)
                    if (urlMatch?.[1]) {
                        const slug = urlMatch[1]
                        const show = showsBySlug.get(slug)

                        if (show) {
                            featuredShows.push(show)
                        } else {
                            console.warn(`Featured show "${slug}" not found in all shows list`)
                        }
                    }
                }
            }
        }

        return featuredShows
    } catch (e: any) {
        // Handle 404 specifically - curated list doesn't exist
        if (e?.response?.status === 404) {
            console.warn(`Featured shows curated list not found (ID: ${config.featuredShowsPageId}). Please check FEATURED_SHOWS_PAGE_ID environment variable.`)
        } else {
            console.error('Error fetching featured shows:', e?.message || e)
        }
        return []
    }
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res

    // Set cache header to match v2 endpoint
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')

    const allShows = await getShows()
    const featuredShows = await getFeaturedShows(allShows)

    // Return structure consistent with v2 endpoint
    return {
        all: allShows,
        featuredShows
    }
})
