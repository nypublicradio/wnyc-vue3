import axios from 'axios'
import humps from 'humps'
import { normalizePublisherPage, normalizeWagtailPage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

// {
//     authorData: {

//     },
//     articles: [{

//     }]
// }


const getStaffData = async (staffSlug: string, cmsSource: string) => {

    switch (cmsSource) {
        case 'wagtail':
            return await getWagtailStaffData(staffSlug);
        case 'publisher':
            return await getPublisherStaffData(staffSlug);
        default:
            return null;
    };
};

// Get story data from CMS

export default defineEventHandler(async (event) => {
    const staffSlug: string | undefined = event?.context?.params?.staffSlug;
    const cmsSource: string | undefined = event?.context?.params?.cmsSource;
    if (staffSlug && cmsSource) {
        const storyData = await getStaffData(staffSlug, cmsSource);
        return storyData;
    }
});