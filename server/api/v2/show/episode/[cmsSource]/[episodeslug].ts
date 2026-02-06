import axios from 'axios'
import humps from 'humps'
import { normalizeArticlePage } from '~/composables/data/articlePages'
import { cmsSources, FALLBACKIMAGELOCAL } from '~/composables/globals'
import { NyprDb } from '~/server/utils/nyprdb'
import { supabaseClient } from '~/server/utils/supabaseClient'
import { NPR } from '~/server/utils/npr'
const config = useRuntimeConfig()

// Get Simplecast episode data directly by UUID
const getSimplecastEpisode = async (episodeId: string) => {
    try {
        // Simplecast API only accepts UUIDs
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(episodeId)
        
        if (!isUUID) {
            console.error('[Simplecast] Invalid episode ID format (must be UUID):', episodeId)
            return null
        }
        
        console.log(`[Simplecast] Fetching episode from Simplecast API: ${episodeId}`)
        console.log(`[Simplecast] API URL: ${config.simplecastUrl}/episodes/${episodeId}`)
        console.log(`[Simplecast] API Key configured: ${config.simplecastApiKey ? 'Yes' : 'No'}`)
        
        if (!config.simplecastApiKey) {
            console.error('[Simplecast] SIMPLECAST_API_KEY is not configured')
            return null
        }
        
        const option = {
            method: 'GET',
            url: `${config.simplecastUrl}/episodes/${episodeId}`,
            headers: {
                'Authorization': config.simplecastApiKey
            }
        };
        const res = await axios(option);
        let resData = humps.camelizeKeys(res.data);
        
        // Add cmsSource to identify this as Simplecast data
        resData.cmsSource = cmsSources.SIMPLECAST
        
        // Normalize the Simplecast response to match our ArticlePage structure
        resData = await normalizeArticlePage(resData)

        return {
            data: resData,
        };
    } catch (e: any) {
        console.error('[Simplecast] Error fetching episode from Simplecast API');
        console.error('[Simplecast] Error message:', e?.message);
        console.error('[Simplecast] Error details:', {
            status: e?.response?.status,
            statusText: e?.response?.statusText,
            data: e?.response?.data,
            hasResponse: !!e?.response,
            errorCode: e?.code,
        });
        if (e?.stack) {
            console.error('[Simplecast] Stack trace:', e.stack);
        }
        return null
    }
}



// Get NPR episode data
const getNPREpisode = async (slug: string) => {
    const npr = new NPR()
    // Fetching the episode details from the NPR API

    const res = await npr.getFromNPR(`documents/${slug}`)
    const resData = res.data
    const episodeImage = await npr.findEpisodeImage(resData.resources[0])
    // From the response find the show details that are in the collections array 
    const showUrl = resData.resources[0].collections
        .filter((collection: { rels: string[]; href: string }) => collection.rels.includes('program'))
        .map((collection: { rels: string[]; href: string }) => collection.href)[0] || ''
    // Fetching the show details to get the show image
    const show = await npr.getDocument(showUrl)
    const showImage = npr.findImageUrl(show)
    const id = String(resData.resources[0].id)
    const showTitle = show.resources[0].title
    // Fetching the audio from the NPR API
    const audio = await npr.findAudio(id, show, showImage?.template)
    // Fallback image to show image when no image is available

    // Fetching the slug of the show from the supabase
    const supabase = supabaseClient()
    const nyprDb = new NyprDb(supabase)

    return {
        data: {
            id,
            showId: show.resources[0].id,
            showSlug: await nyprDb.getNPRSlugFromSupabase(show.resources[0].id),
            title: resData.resources[0].title,
            tease: resData.resources[0].teaser,
            meta: {
                slug: resData.resources[0].id,
                firstPublishedAt: resData.resources[0].publishDateTime,
            },
            slug: resData.resources[0].slug,
            publicationDate: resData.resources[0].publishDateTime,
            sortDate: resData.resources[0].publishDateTime,
            cmsSource: cmsSources.NPR,
            type: 'episode',
            headers: {
                brand: {
                    title: cmsSources.NPR,
                    logoImage: showImage,
                }
            },
            audio,
            image: episodeImage,
            imageMain: showImage,
            showTitle,
            url: resData.resources[0].webPages[0]?.href,
        },
    }

}

// Get episode data
const getEpisode = async (slug: string) => {

    const option = {
        method: 'GET',
        url: `${config.public.PUBLISHER_BASE_API}v3/story/${slug}`
    }
    const res = await axios(option)
    let resData = humps.camelizeKeys(res.data).data
    // fallback image to show image when no image is available
    resData.attributes.imageMain = resData.attributes.imageMain ? resData.attributes.imageMain : resData.attributes.headers.brand.logoImage ? resData.attributes.headers.brand.logoImage : { template: FALLBACKIMAGELOCAL }
    resData.cmsSource = cmsSources.PUBLISHER
    resData = normalizeArticlePage(resData)

    //Passing meta and data separately to the client. Meta is to used for pagination
    return {
        data: resData,
    }

}

export default defineEventHandler(async (event) => {
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.episodeslug
    const cmsSource: string | undefined = event?.context?.params?.cmsSource

    //Fetching query params
    if (slug && cmsSource) {
        let episode
        if (cmsSource === cmsSources.NPR) {
            // Get show details
            episode = await getNPREpisode(slug)
        } else if (cmsSource === cmsSources.SIMPLECAST || cmsSource === 'simplecast') {
            // Get Simplecast episode
            episode = await getSimplecastEpisode(slug)
        } else {
            // Get show details
            episode = await getEpisode(slug)
        }
        return episode?.data
    }
    return null
})