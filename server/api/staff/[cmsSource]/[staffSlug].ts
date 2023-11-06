import axios from 'axios'
import humps from 'humps'
import type { ArticlePage } from '~~/composables/types/Page'
import { normalizePublisherPage, normalizeWagtailPage, normalizeAuthor, normalizeArticlePage } from '~/composables/data/articlePages'
const GOTHAMISTDOTCOM = 'https://gothamist.com/'
const config = useRuntimeConfig();

const getWagtailImageId = (article: any) => {
    console.log()
    const listingImage =
        article.leadAsset?.[0]?.value?.image ??
        article.leadAsset?.[0]?.value?.defaultImage
    if (!listingImage) return ''
    return String(listingImage.id)
}

// returns the article link
const getArticleLink = (article: any) => {
    if (article.ancestry) {
        return `${GOTHAMISTDOTCOM}${article.ancestry[0].slug}/${article.meta.slug}`
    } else if (article.path) {
        return article.path.replace('/home/', GOTHAMISTDOTCOM)
    }
    return GOTHAMISTDOTCOM
}

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
    const resData = humps.camelizeKeys(res.data).items;
    const author = resData[0].relatedAuthors.map((author: any) => {
        if (author.slug === staffSlug) {
            return normalizeAuthor(humps.camelizeKeys(author));
        }
    });

    const articles = resData.map((article: any) => {
        article.authors = article.relatedAuthors.map((author: any) => {
            return normalizeAuthor(author);
        });
        article.link = getArticleLink(article);
        article.type = 'story';
        article.leadImage = getWagtailImageId(article);
        article.leadImageMaxWidth = article.leadAsset?.[0]?.value?.image?.width;
        article.leadImageMaxHeight = article.leadAsset?.[0]?.value?.image?.height;
        article.cmsSource = 'wagtail';
        article.sortDate = article.publicationDate;
        return article
    });

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
            return await getWagtailStaffData(staffSlug, offset);
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