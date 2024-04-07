import axios from 'axios'
import humps from 'humps'
import { cmsSources } from '~/composables/globals'
import { normalizeAuthor, normalizeArticlePage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

const getWagtailStaffData = async (staffSlug: string, offset: number) => {
    const options = {
        method: 'GET',
        url: `${config.public.AVIARY_BASE_API}pages/`,
        params: {
            author_slug: staffSlug,
            type: 'news.ArticlePage',
            fields: 'id,title,lead_asset,related_authors,publication_date,ancestry,body',
            order: '-publication_date',
            limit: 10,
            offset: offset,
        },
    };
    const res = await axios(options);
    const resData = humps.camelizeKeys(res.data).items;
    const author = resData[0].relatedAuthors.filter((author) => {
        return author.slug === staffSlug;
    }).map(author => normalizeAuthor(author));

    const articles = await Promise.all(resData.map((article: any) => {
        article.cmsSource = cmsSources.WAGTAIL;
        article.sortDate = article.publicationDate;
        return normalizeArticlePage(article);
    }));
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
        case cmsSources.WAGTAIL:
            return await getWagtailStaffData(staffSlug, offset);
        case cmsSources.PUBLISHER:
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
    const query: { offset: number } = getQuery(event) || { offset: 0 };

    if (staffSlug && cmsSource) {
        const storyData = await getStaffData(staffSlug, cmsSource, query.offset);
        return storyData;
    } else {
        return null
    }
});