import axios from 'axios'
import humps from 'humps'
import { normalizeSimplecastListItem } from '~/composables/data/articlePages'
import { cmsSources } from '~/composables/globals'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

/**
 * Fetch episodes from Simplecast API for a specific podcast
 * @param podcastId - The Simplecast podcast UUID
 * @param offset - Starting position for pagination (default: 0)
 * @param limit - Number of episodes to return (default: 10)
 * @returns Promise containing episodes array and pagination metadata
 */
const getSimplecastEpisodes = async (podcastId: string, offset = 0, limit = 10) => {
    const config = __getConfig()

    try {
        // Validate that podcastId is a UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(podcastId)

        if (!isUUID) {
            console.error('[Simplecast Episodes] Invalid podcast ID format (must be UUID):', podcastId)
            return {
                data: [],
                meta: {
                    totalCount: 0,
                    pagination: {
                        offset,
                        limit,
                        count: 0,
                        total: 0
                    }
                }
            }
        }

        // Get API key from config
        const apiKey = config.simplecastApiKey || process.env.SIMPLECAST_API_KEY

        if (!apiKey) {
            console.error('[Simplecast Episodes] SIMPLECAST_API_KEY is not configured')
            return {
                data: [],
                meta: {
                    totalCount: 0,
                    pagination: {
                        offset,
                        limit,
                        count: 0,
                        total: 0
                    }
                }
            }
        }

        // Make request to Simplecast API
        const options = {
            method: 'GET',
            url: `${config.simplecastUrl}/podcasts/${podcastId}/episodes`,
            params: {
                status: 'published',
                offset,
                limit
            },
            headers: {
                'Authorization': apiKey
            },
            timeout: 15000 // 15 second timeout
        }

        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)
        //console.log("resData", resData)
        // Extract episodes collection
        const episodes = resData.collection || []

        // Get show info from the first episode (if available) for normalization
        let showId = podcastId
        let showTitle: string | undefined
        let showImageUrl: string | undefined

        if (episodes.length > 0 && episodes[0].podcast) {
            showId = episodes[0].podcast.id || podcastId
            showTitle = episodes[0].podcast.title
            showImageUrl = episodes[0].podcast.imageUrl
        }

        // Normalize each episode using the existing normalizer
        const normalizedEpisodes = await Promise.all(
            episodes.map(async (episode: any) => {
                // Enhance episode data with show information for normalization
                const enhancedEpisode = {
                    ...episode,
                    showId,
                    showTitle,
                    showImageUrl,
                    cmsSource: cmsSources.SIMPLECAST
                }

                return await normalizeSimplecastListItem(enhancedEpisode)
            })
        )

        // Calculate pagination metadata
        // Note: Simplecast doesn't return total count in the response,
        // so we can only provide limited pagination info
        const hasMore = episodes.length === limit
        const currentPage = Math.floor(offset / limit) + 1
        console.log("normalizedEpisodes", normalizedEpisodes)
        return {
            data: normalizedEpisodes,
            meta: {
                totalCount: episodes.length, // Only count for current page
                hasMore, // Indicator if there might be more episodes
                pagination: {
                    offset,
                    limit,
                    count: normalizedEpisodes.length,
                    page: currentPage,
                    nextOffset: hasMore ? offset + limit : null
                }
            }
        }
    } catch (error: any) {
        console.error('[Simplecast Episodes] Error fetching episodes:', {
            message: error?.message,
            status: error?.response?.status,
            statusText: error?.response?.statusText,
            data: error?.response?.data
        })

        return {
            data: [],
            meta: {
                totalCount: 0,
                pagination: {
                    offset,
                    limit,
                    count: 0,
                    page: Math.floor(offset / limit) + 1,
                    nextOffset: null
                },
                error: {
                    message: error?.response?.data?.error || error?.message || 'Failed to fetch episodes',
                    status: error?.response?.status
                }
            }
        }
    }
}

/**
 * V3 Episodes endpoint handler
 * 
 * Query Parameters:
 * - offset: Starting position for pagination (default: 0)
 * - limit: Number of episodes per page (default: 10, max: 100)
 * 
 * Example usage:
 * - GET /api/v3/show/{podcast-uuid}/episodes
 * - GET /api/v3/show/{podcast-uuid}/episodes?offset=0&limit=20
 * - GET /api/v3/show/{podcast-uuid}/episodes?offset=20&limit=20
 */
export default defineEventHandler(async (event) => {
    const res = event?.node?.res
    const showslug: string | undefined = event?.context?.params?.showslug
    console.log("showslug", showslug)
    // Validate showslug parameter
    if (!showslug) {
        return {
            data: [],
            meta: {
                error: {
                    message: 'Missing podcast ID parameter',
                    status: 400
                }
            }
        }
    }

    // Get query parameters for pagination
    const query = getQuery(event)

    // Parse offset (default: 0)
    const offset: number = Array.isArray(query.offset)
        ? Number(query.offset[0])
        : (query.offset ? Number(query.offset) : 0)

    // Parse limit (default: 10, max: 100)
    let limit: number = Array.isArray(query.limit)
        ? Number(query.limit[0])
        : (query.limit ? Number(query.limit) : 10)

    // Enforce maximum limit of 100
    limit = Math.min(limit, 100)

    // Fetch episodes from Simplecast
    const episodes = await getSimplecastEpisodes(showslug, offset, limit)

    // Set cache header for better performance
    res.setHeader('Cache-Control', 'max-age=300, stale-while-revalidate=600')

    return episodes
})
