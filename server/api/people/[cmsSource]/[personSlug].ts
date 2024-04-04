import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { normalizeAuthor, normalizeArticlePage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

const getPublisherPersonData = async (personSlug: string) => {

    const res = await axios(`${config.public.PUBLISHER_BASE_API}/v3/person/${personSlug}`);
    const resData = humps.camelizeKeys(res.data.data);
    //const person = normalizeAuthor(resData);

    return resData
};

const getWagtailPersonData = async (personSlug: string) => {
    //todo: call publisher api to get staff data with article list
};

const getPersonData = async (personSlug: string, cmsSource: string) => {

    switch (cmsSource) {
        case cmsSources.WAGTAIL:
            return await getWagtailPersonData(personSlug);
        case cmsSources.PUBLISHER:
            return await getPublisherPersonData(personSlug);
        default:
            return null;
    };
};

// Get story data from CMS

export default defineEventHandler(async (event) => {
    const personSlug: string | undefined = event?.context?.params?.personSlug;
    const cmsSource: string | undefined = event?.context?.params?.cmsSource;

    if (personSlug && cmsSource) {
        const personData = await getPersonData(personSlug, cmsSource);
        return personData;
    } else {
        return null
    }
});