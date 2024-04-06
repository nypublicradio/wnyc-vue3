import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { normalizePerson } from '~/composables/data/articlePages'


const config = useRuntimeConfig();

// getting person data from publisher api
const getPublisherPersonData = async (personSlug: string) => {

    const res = await axios(`${config.public.PUBLISHER_BASE_API}/v3/person/${personSlug}`);
    const resData = humps.camelizeKeys(res.data.data);
    const person = await normalizePerson(resData);
    return person
};

const getWagtailPersonData = async (personSlug: string) => {
    //todo: call publisher api to get staff data with article list
    // I don't think we have a wagtail endpoint for this
    await getPublisherPersonData(personSlug);

};

// get person data from the proper CMS
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