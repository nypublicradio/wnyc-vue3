import axios from 'axios'
import humps from 'humps'
import type { ArticlePage } from '~~/composables/types/Page'
import { normalizePublisherPage, normalizeWagtailPage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

// {
//     authorData: {

//     },
//     articles: [{

//     }]
// }

const getWagtailStaffData = async (staffSlug: string, offset: number) => {
    const options = {
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/`,
        params: {
            author_slug: staffSlug,
            type: 'news.ArticlePage',
            fields: 'id,title,lead_asset,related_authors,publication_date,ancestry',
            order: '-publication_date',
            limit: 10,
            offset: offset,
        },
    };
    const res = await axios(options);
    const author = res.data.items[0].related_authors.map((author: any) => {
        return author;
    });
    const articles = res.data.items.map((item: ArticlePage) => normalizeWagtailPage(item));
    return {
        authorData: author,
        articles,
        count: res.data.meta.total_count,
    }
};

const getPublisherStaffData = async (staffSlug: string) => {
    //todo: call publisher api to get staff data with article list
};

const getStaffData = async (staffSlug: string, cmsSource: string, offset: number) => {

    switch (cmsSource) {
        case 'wagtail':
            return await getWagtailStaffData(staffSlug,offset);
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
    // query params
    const offset: number = event?.context?.query?.offset || 0;
    if (staffSlug && cmsSource) {
        const storyData = await getStaffData(staffSlug, cmsSource, offset);
        return storyData;
    }
});