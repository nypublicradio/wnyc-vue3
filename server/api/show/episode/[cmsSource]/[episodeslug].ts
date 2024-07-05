import axios from 'axios'
import humps from 'humps'
import { normalizeArticlePage } from '~/composables/data/articlePages'
import { cmsSources, FALLBACKIMAGELOCAL } from '~/composables/globals';
import { NPR } from '~/server/utils/npr';

const config = useRuntimeConfig()

const getNPREpisode = async (slug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.NPR_CDS_API}/v1/documents/${slug}`,
            headers: {
                Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
            },
        };
        const res = await axios(option);
        const resData = res.data;
        // Fetching the audio from the NPR API
        const npr = new NPR();
        const audio = await npr.findAudio(resData.resources[0]);

        return {
            data: {
                id: resData.resources[0].id,
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
                audio: audio,
                imageMain: { template: FALLBACKIMAGELOCAL },
            },
        };
    } catch (e) {
        //console.log(e);
    }
    return null
};

const getEpisode = async (slug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/story/${slug}`
        };
        const res = await axios(option);
        let resData = humps.camelizeKeys(res.data).data;
        // fallback image to show image when no image is available
        resData.attributes.imageMain = resData.attributes.imageMain ? resData.attributes.imageMain : resData.attributes.headers.brand.logoImage ? resData.attributes.headers.brand.logoImage : { template: FALLBACKIMAGELOCAL };
        resData.cmsSource = cmsSources.PUBLISHER
        resData = normalizeArticlePage(resData)

        //Passing meta and data separately to the client. Meta is to used for pagination
        return {
            data: resData,
        };
    } catch (e) {
        //console.log(e);
    }
    return null
}

export default defineEventHandler(async (event) => {
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.episodeslug;
    const cmsSource: string | undefined = event?.context?.params?.cmsSource;
    //Fetching query params
    if (slug && cmsSource) {
        let episode;
        if (cmsSource === 'npr') {
            // Get show details
            episode = await getNPREpisode(slug);
        } else {
            // Get show details
            episode = await getEpisode(slug);
        }
        return episode.data;
    }
    return null;
});