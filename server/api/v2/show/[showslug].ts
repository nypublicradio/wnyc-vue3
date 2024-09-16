import axios from 'axios'
import humps from 'humps'
import { cmsSources, mediaTypes, FALLBACKIMAGE } from '~/composables/globals'
import { normalizeArticlePage } from '~/composables/data/articlePages'
import { NyprDb } from '~/server/utils/nyprdb'
import { supabaseClient } from '~/server/utils/supabaseClient';
import { NPR } from '~/server/utils/npr';


const config = useRuntimeConfig();
const supabase = supabaseClient();
const nyprDb = new NyprDb(supabase);
const npr = new NPR();

const getNPREpisodes = async (slug: string, type: string, pageSize: string, page: number, showTitle: string) => {

    const show = await nyprDb.getNPRShowBySlug(slug);
    // Fetching the episodes from the NPR API and normalizing the data
    const option = {
        method: 'GET',
        url: `${config.public.NPR_CDS_API}/v1/documents`,
        headers: {
            Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
        },
        params: {
            profileIds: 'program-episode',
            collectionIds: show[0].showId,
            sort: 'publishDateTime:desc',
        },

    };
    const res = await axios(option);

    let episodes = [];
    episodes = await Promise.all(res.data.resources.map(async (item) => {
        const audio = await npr.findAudio(item);
        return {
            id: item.id,
            title: item.title,
            showTitle,
            tease: item.teaser,
            meta: {
                slug: item.id,
                firstPublishedAt: item.publishDateTime,
            },
            slug: item.slug,
            publicationDate: item.publishDateTime,
            sortDate: item.publishDateTime,
            cmsSource: cmsSources.NPR,
            type: 'episode',
            audio,
            imageMain: { FALLBACKIMAGE }
        };
    }));

    return {
        data: episodes,
        meta: {
            pagination: {
                page: page,
                pages: 1000,
                count: 10000,
            }
        }
    };
};

const getEpisodes = async (slug: string, showImage: string, type?: string, pageSize?: string, page?: number) => {
    // If page is not defined, set it to 1
    if (!page) {
        page = 1;
    }
    const option = {
        method: 'GET',
        url: `${config.public.PUBLISHER_BASE_API}v3/story/`,
        params: {
            [type]: slug,
            // channel: slug,
            ordering: '-newsdate',
            page,
            page_size: Number(pageSize),
            audio_only: true,
        }
    };
    const res = await axios(option);
    const resData = await Promise.all(res.data.data.map(async (item: any) => {
        item.cmsSource = cmsSources.PUBLISHER;
        item.showImage = showImage;
        return await normalizeArticlePage(humps.camelizeKeys(item))
    }));
    //Passing meta and data separately to the client. Meta is to used for pagination
    return {
        data: resData,
        meta: humps.camelizeKeys(res.data).meta
    };
}

// gets the publisher show data
const getShow = async (slug: string) => {
    const nprShows = await nyprDb.getNPRShowBySlug(slug);
    if (nprShows.length > 0) {
        const fetchedShows = await Promise.all(nprShows.map(async (show) => {
            const options = {
                method: 'GET',
                url: `${config.public.NPR_CDS_API}/v1/documents/${show.showId}`,
                headers: {
                    Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
                }
            };
            const { data } = await axios(options);
            const image = npr.findImageUrl(data);
            return {
                id: show.showId,
                title: show.title,
                slug: show.slug,
                description: data.resources[0]?.teaser,
                tease: data.resources[0]?.shortTeaser,
                image,
                cmsSource: cmsSources.NPR,
                type: cmsSources.NPR,
                url: data.resources[0]?.webPages[0]?.href,
            }
        }));
        return fetchedShows[0];
    } else {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v1/list/shows-for-app/`,
        };
        const res = await axios(option);
        const resData = humps.camelizeKeys(res.data).results;
        // Find the show from the list of shows
        const show = resData.find((s) => {
            return s.slug === slug
        });
        show.image.template = show.image.url.replace('raw', '%s/%s/%s/%s');
        show.cmsSource = cmsSources.PUBLISHER
        show.type = mediaTypes.SHOW
        show.url = show.url ?? `${config.public.WNYC_SHOW_SHARE_BASE_URL}${show.slug}`
        return show;
    }
}

export default defineEventHandler(async (event) => {
    const res = event?.node?.res;
    //Fetching slug and type from the path params
    const slug: string | undefined = event?.context?.params?.showslug;

    //Fetching query params
    const query = getQuery(event);
    const page: number | undefined = Array.isArray(query.page) ? query.page[0] : query.page;
    const pageSize: string | undefined = query.pageSize?.toString() ?? '10';
    if (slug) {
        let episodes;
        // Get show details
        const show = await getShow(slug);
        if (show?.type === cmsSources.NPR) {
            episodes = await getNPREpisodes(slug, show.type, pageSize, page, show?.title);
        } else {
            episodes = await getEpisodes(slug, show?.image?.template, show?.type, pageSize, page);
        }
        res.setHeader('Cache-Control', 'maxage=3600, stale-while-revalidate');
        //console.log('page = ', page)
        return {
            show,
            episodes,
        }
    } else {
        return null;
    }
})
