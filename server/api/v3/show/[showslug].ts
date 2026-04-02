import axios from 'axios'
import humps from 'humps'
import { transformCuratedContent } from '~/utilities/curatedContent'
import { normalizeWagtailShowDetail } from '~/composables/data/shows'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

/**
 * Get episodes for a show from Wagtail API (extracted from show body curated content)
 * @param showData - The complete show data object
 * @param page - Page number
 * @param pageSize - Number of episodes per page
 * @param showSlug - Optional show slug to pass to NPR content
 * @returns Episodes data with pagination metadata
 */
const getWagtailEpisodes = async (showData: any, page = 1, pageSize = '10', showSlug?: string) => {
    try {
        // If no body or body is not an array, return empty
        if (!showData.body || !Array.isArray(showData.body)) {
            return {
                data: [],
                meta: {
                    totalCount: 0,
                    pagination: {
                        page,
                        pages: 0,
                        count: 0,
                        total: 0
                    }
                }
            }
        }

        // Transform curated content to normalize episodes
        const transformedContent = await transformCuratedContent(showData.body, 'default', showSlug)

        // Extract all episodes from the transformed curated lists
        const allEpisodes: any[] = []

        for (const block of transformedContent) {
            if (block.type === 'curated_list' && block.value?.list?.listItems) {
                for (const item of block.value.list.listItems) {
                    // Episodes have already been normalized by transformCuratedContent
                    if (item.type === 'episode') {
                        allEpisodes.push(item)
                    }
                }
            }
        }

        if (allEpisodes.length === 0) {
            return {
                data: [],
                meta: {
                    totalCount: 0,
                    pagination: {
                        page,
                        pages: 0,
                        count: 0,
                        total: 0
                    }
                }
            }
        }

        // Apply pagination
        const limit = Number(pageSize)
        const offset = (page - 1) * limit
        const paginatedEpisodes = allEpisodes.slice(offset, offset + limit)

        return {
            data: paginatedEpisodes,
            meta: {
                totalCount: allEpisodes.length,
                pagination: {
                    page,
                    pages: Math.ceil(allEpisodes.length / limit),
                    count: paginatedEpisodes.length,
                    total: allEpisodes.length
                }
            }
        }
    } catch (error: any) {
        console.error('Error extracting Wagtail episodes:', error?.response?.data || error?.message || error)
        return {
            data: [],
            meta: {
                totalCount: 0,
                pagination: {
                    page,
                    pages: 0,
                    count: 0,
                    total: 0
                }
            }
        }
    }
}

/**
 * Get show data from Wagtail API
 * @param slug - The show slug
 * @returns Normalized show object
 */
const getWagtailShow = async (slug: string) => {
    const config = __getConfig()

    try {
        const options = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/`,
            params: {
                type: 'shows.ShowPage',
                slug,
                fields: 'description,topper_display_title,linked_data_source,show_art,show_logo,topper_background,body,about_module,can_download_episodes,can_embed_episodes,in_page_navigation',
            },
            headers: {
                'X-CMS-Site': config.public.cmsSite ?? 'demo.wnyc.org:443'
            }
        }

        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)

        // Get the first matching show
        const showData = resData.items?.[0]

        if (!showData) {
            console.error('[Wagtail Show] Show not found for slug:', slug)
            return null
        }

        // Normalize show data
        const normalized = normalizeWagtailShowDetail(showData, slug)

        return {
            ...normalized,
            _rawData: showData, // Store raw data for episode extraction
        }
    } catch (error: any) {
        console.error('[Wagtail Show] Error fetching show:', error?.response?.data || error?.message || error)
        return null
    }
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    const slug: string | undefined = event?.context?.params?.showslug

    // Get query params
    const query = getQuery(event)
    const page: number = Array.isArray(query.page) ? Number(query.page[0]) : (query.page ? Number(query.page) : 1)
    const pageSize: string = query.pageSize?.toString() ?? '10'

    if (!slug) {
        return null
    }

    // Get show details from Wagtail only
    const show = await getWagtailShow(slug)
    if (!show) {
        return null
    }

    // Extract raw data before sending response
    const showDataForEpisodes = show._rawData
    delete show._rawData // Don't send raw data to client

    // Get episodes from show body (transformed through curated content pipeline)
    const episodes = await getWagtailEpisodes(
        showDataForEpisodes,
        page,
        pageSize,
        slug
    )

    // Set cache header to match v2 endpoint
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')

    return {
        show,
        episodes,
    }
})
