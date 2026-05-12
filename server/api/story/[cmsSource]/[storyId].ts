import axios from 'axios'
import humps from 'humps'
import { normalizePublisherPage, normalizeWagtailPage } from '~/composables/data/articlePages'
import { getCmsPathRedirect, getCmsRequestOptions } from '~/server/utils/cmsRedirect'

const config = useRuntimeConfig();

const getWagtailStoryData = async (id: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}pages/${id}/`,
            headers: {
                'X-CMS-Site': config.public.cmsSite
            }
        };
        const res = await axios(option);
        //return humps.camelizeKeys(res.data);

        return normalizeWagtailPage(humps.camelizeKeys(res.data));
    } catch (e: any) {
        if (e?.response?.status === 404) {
            return await getCmsRedirectForStoryPath(id)
        }
        //console.log(e);
    }
    return null
};

const getCmsRedirectForStoryPath = async (slug: string) => {
    const requestOptions = getCmsRequestOptions(config.public.cmsSite)
    return await getCmsPathRedirect(config.public.AVIARY_BASE_API, `/story/${slug}`, requestOptions)
}

const getPublisherStoryData = async (idOrSlug: string) => {
    try {
        // Determine if the identifier is numeric (ID) or a slug
        const isNumericId = /^\d+$/.test(idOrSlug);
        const endpoint = isNumericId 
            ? `v3/story-pk/${idOrSlug}/`
            : `v3/story/${idOrSlug}/`;
        
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}${endpoint}`,
        };
        const res = await axios(option);
        return normalizePublisherPage(humps.camelizeKeys(res.data).data);
    } catch (e: any) {

        if (e.response && e.response.status === 404) {
            return await getCmsRedirectForStoryPath(idOrSlug)
        } else {
            console.error(e);
        }
    }
    return null
};

const getStoryData = async (id: string, cmsSource: string) => {

    switch (cmsSource) {
        case 'wagtail':
            return await getWagtailStoryData(id);
        case 'publisher':
            return await getPublisherStoryData(id);
        default:
            return null;
    };
};

// Get story data from CMS

export default defineEventHandler(async (event) => {
    //console.log("getting story data")
    const id: string | undefined = event?.context?.params?.storyId;
    const cmsSource: string | undefined = event?.context?.params?.cmsSource;
    if (id && cmsSource) {
        const storyData = await getStoryData(id, cmsSource);
        return storyData;
    }
    return null
});
