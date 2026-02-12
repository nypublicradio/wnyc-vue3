import axios from "axios"
import humps from "humps"
import { cmsSources } from '~/composables/globals'

const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

/**
 * Normalize a single show item from the API
 * @param show - Raw show data from API
 * @returns Normalized show object
 */
const normalizeShow = (show: any) => {
    return {
        id: show.id,
        title: show.title,
        slug: show.meta?.slug || '',
        description: show.description,
        topperDisplayTitle: show.topperDisplayTitle,
        linkedDataSource: show.linkedDataSource,
        showArt: show.showArt,
        showLogo: show.showLogo,
        topperBackground: show.topperBackground,
        inPageNavigation: show.inPageNavigation,
        body: show.body,
        aboutModule: show.aboutModule,
        canDownloadEpisodes: show.canDownloadEpisodes,
        canEmbedEpisodes: show.canEmbedEpisodes,
        image: show.showArt?.url || show.showArt?.renditions?.find((r: any) => r.name === 'small')?.url || '/fallback-ep.png',
        cmsSource: cmsSources.WAGTAIL,
        type: show.meta?.type || 'shows.ShowPage',
        url: show.meta?.htmlUrl || `/browse/shows/${show.meta?.slug}`,
    }
}

/**
 * Fetches shows from the Wagtail CMS API
 * @returns Promise that resolves to an object containing shows array and metadata
 */
export const getShows = async () => {
    const config = __getConfig();
    
    try {
        const options = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/`,
            params: {
                type: 'shows.ShowPage',
                show_on_index_listing: true,
                fields: 'description,topper_display_title,linked_data_source,show_art,show_logo,topper_background,body,about_module,can_download_episodes,can_embed_episodes,in_page_navigation',
                order: 'title',
                site: 'demo.wnyc.org',
            },
            headers: {
                'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443'
            }
        }

        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data);
        
        // Normalize each show item
        const shows = (resData.items || []).map(normalizeShow)
        
        return shows
    } catch (e) {
        console.error('Error fetching shows:', e)
        return []
    }
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res

    // Set cache header to match v2 endpoint
    res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')

    const allShows = await getShows()
    
    // Return structure consistent with v2 endpoint
    return {
        all: allShows,
        featuredShows: []  // TODO: Implement featured shows logic when Wagtail supports it
    }
})
