import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'

const config = useRuntimeConfig();

// getting team data from publisher api
const getPublisherTeamData = async (showSlug: string) => {
    const res = await axios(`${config.public.PUBLISHER_BASE_API}/v3/channel/shows/${showSlug}/the-team`);
    const resData = humps.camelizeKeys(res.data);
    return resData
};

const getWagtailTeamData = async (showSlug: string) => {
    // to do - not sure if there is an endpoint for this in wagtail
    await getPublisherTeamData(showSlug);
};

// get team data from the proper CMS
const getTeamData = async (showSlug: string, cmsSource: string) => {
    switch (cmsSource) {
        case cmsSources.WAGTAIL:
            return await getWagtailTeamData(showSlug);
        case cmsSources.PUBLISHER:
            return await getPublisherTeamData(showSlug);
        default:
            return null;
    };
};

// Get team data from CMS
export default defineEventHandler(async (event) => {
    const showSlug: string | undefined = event?.context?.params?.showSlug;
    const cmsSource: string | undefined = event?.context?.params?.cmsSource;
    if (showSlug && cmsSource) {
        const teamData = await getTeamData(showSlug, cmsSource);
        return teamData;
    } else {
        return null
    }
});