import axios from 'axios'
import humps from 'humps'
import { cmsSources, mediaTypes, FALLBACKIMAGE } from '~/composables/globals'
import { normalizeArticleListItem } from '~/composables/data/articlePages'
import { useVImage } from "~/composables/useVImage"

const { templatizeImageUrl } = useVImage()

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

/**
 * Normalize a single episode item from Simplecast data embedded in Wagtail
 * @param episode - Raw episode data from Simplecast
 * @param showImage - Show image template for fallback
 * @param showTitle - Show title for episode metadata
 * @returns Normalized episode object
 */
const normalizeEpisode = async (episode: any, showImage: string, showTitle: string) => {
    // Map Simplecast episode data to the format expected by normalizeArticleListItem
    const mappedEpisode = {
        id: episode.id,
        uuid: episode.id,
        title: episode.title,
        description: episode.description,
        body: episode.description,
        tease: episode.description,
        showId: episode.showId,
        showTitle: episode.showTitle || showTitle,
        showImageUrl: episode.showImageUrl,
        image: episode.imageUrl,
        imageUrl: episode.imageUrl,
        enclosureUrl: episode.enclosureUrl,
        duration: episode.duration,
        publicationDate: episode.publishedAt,
        publishedAt: episode.publishedAt,
        slug: episode.slug,
        season: episode.season,
        number: episode.number,
        status: episode.status,
        type: 'episode',
        cmsSource: cmsSources.SIMPLECAST,
        showImage,
    }
    
    return await normalizeArticleListItem(mappedEpisode)
}

/**
 * Extract episodes from show body curated lists
 * @param body - The show body array containing curated lists
 * @returns Array of episode items
 */
const extractEpisodesFromBody = (body: any[]): any[] => {
    if (!body || !Array.isArray(body)) {
        return []
    }
    
    const episodes: any[] = []
    
    // Loop through body blocks and find curated_list items
    for (const block of body) {
        if (block.type === 'curated_list' && block.value?.list?.listItems) {
            // Extract episodes from the list items
            for (const item of block.value.list.listItems) {
                if (item.contentType === 'episode' && item.content) {
                    episodes.push({
                        ...item.content,
                        // Add additional fields from the list item
                        body: item.body,
                        subtitle: item.subtitle,
                    })
                }
            }
        }
    }
    
    return episodes
}

/**
 * Get episodes for a show from Wagtail API (extracted from show body)
 * @param showData - The complete show data object
 * @param showImage - Show image template for fallback
 * @param showTitle - Show title for episode metadata
 * @param pageSize - Number of episodes per page
 * @param page - Page number
 * @returns Episodes data with pagination metadata
 */
const getWagtailEpisodes = async (showData: any, showImage: string, showTitle: string, pageSize: string = '10', page: number = 1) => {
    const config = __getConfig()
    
    try {
        // Extract all episodes from the body
        const allEpisodes = extractEpisodesFromBody(showData.body)
        
        if (allEpisodes.length === 0) {
            return {
                data: [],
                meta: { totalCount: 0 }
            }
        }
        
        // Apply pagination
        const limit = Number(pageSize)
        const offset = (page - 1) * limit
        const paginatedEpisodes = allEpisodes.slice(offset, offset + limit)
        
        // Normalize each episode
        const episodes = await Promise.all(
            paginatedEpisodes.map((item: any) => normalizeEpisode(item, showImage, showTitle))
        )
        
        return {
            data: episodes,
            meta: {
                totalCount: allEpisodes.length,
                pagination: {
                    page: page,
                    pages: Math.ceil(allEpisodes.length / limit),
                    count: episodes.length,
                    total: allEpisodes.length
                }
            }
        }
    } catch (error: any) {
        console.error('Error extracting Wagtail episodes:', error?.response?.data || error?.message || error)
        return {
            data: [],
            meta: {}
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
                slug: slug,
                fields: 'description,topper_display_title,linked_data_source,show_art,show_logo,topper_background,body,about_module,can_download_episodes,can_embed_episodes,in_page_navigation',
            },
            headers: {
                'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
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
        
        // Normalize show image
        let showImage = showData.showArt?.url || showData.showArt?.renditions?.find((r: any) => r.name === 'small')?.url
        let imageTemplate = showImage ? templatizeImageUrl(showImage) : undefined
        
        return {
            id: showData.id,
            title: showData.title,
            slug: showData.meta?.slug || slug,
            description: showData.description,
            topperDisplayTitle: showData.topperDisplayTitle,
            linkedDataSource: showData.linkedDataSource,
            showArt: showData.showArt,
            showLogo: showData.showLogo,
            topperBackground: showData.topperBackground,
            inPageNavigation: showData.inPageNavigation,
            body: showData.body,
            aboutModule: showData.aboutModule,
            canDownloadEpisodes: showData.canDownloadEpisodes,
            canEmbedEpisodes: showData.canEmbedEpisodes,
            image: showImage ? { 
                url: showImage, 
                template: imageTemplate 
            } : { url: FALLBACKIMAGE, template: FALLBACKIMAGE },
            cmsSource: cmsSources.WAGTAIL,
            type: mediaTypes.SHOW,
            url: showData.meta?.htmlUrl || `/browse/shows/${slug}`,
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
    
    // Get episodes from show body
    const episodes = await getWagtailEpisodes(
        showDataForEpisodes,
        show.image?.template || FALLBACKIMAGE,
        show.title,
        pageSize,
        page
    )
    
    // Set cache header to match v2 endpoint
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')
    
    return {
        show,
        episodes,
    }
})
