import axios from 'axios'
import humps from 'humps'
import { normalizeArticlePage } from '~/composables/data/articlePages'
import { cmsSources, FALLBACKIMAGELOCAL } from '~/composables/globals';

const config = useRuntimeConfig()

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
    //Fetching query params
    if (slug) {
        // Get show details
        const episode = await getEpisode(slug);

        return episode.data

    }
    return null;
});