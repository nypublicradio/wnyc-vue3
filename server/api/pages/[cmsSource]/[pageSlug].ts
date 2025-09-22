import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'

// Helper to obtain runtime config, with test override support.
const __getConfig = () => {
    const testCfg = (globalThis as any)?.__testRuntimeConfig
    return testCfg ?? useRuntimeConfig()
}

// getting flat page data from the publisher api
const getPublisherPageData = async (pageSlug: string) => {
    const config = __getConfig();
    const res = await axios(`${config.public.PUBLISHER_BASE_API}v3/flatpages/${pageSlug}`);
    const resData = humps.camelizeKeys(res.data);
    return resData
};

// getting page data from the wagtail api
const getWagtailPageData = async (pageSlug: string) => {
    const config = __getConfig();
    const res = await axios(`${config.public.AVIARY_BASE_API}pages/${pageSlug}`);
    const resData = humps.camelizeKeys(res.data);
    return resData
};

// get page data from the proper CMS
const getPageData = async (pageSlug: string, cmsSource: string) => {
    switch (cmsSource) {
        case cmsSources.WAGTAIL:
            return await getWagtailPageData(pageSlug);
        case cmsSources.PUBLISHER:
            return await getPublisherPageData(pageSlug);
        default:
            return null;
    };
};

// get page data from CMS
export default async function (event) {
    const pageSlug: string | undefined = event?.context?.params?.pageSlug;
    const cmsSource: string | undefined = event?.context?.params?.cmsSource;
    if (pageSlug && cmsSource) {
        const PageData = await getPageData(pageSlug, cmsSource);
        return PageData;
    } else {
        return null
    }
}
