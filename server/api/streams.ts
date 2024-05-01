const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'

const getLivestreams = async () => {
    try {
        // calls v1 api to access source_tags
        const streams_v1_url = `${config.public.PUBLISHER_BASE_API}/v1/list/streams/`;
        const res_v1 = await axios(streams_v1_url);
        // filters/selects the streams that include the new-wnyc-app source_tag
        const res_v1_filtered = res_v1.data.results.filter((item) => item.source_tags.includes('new-wnyc-app'))

        //const stream_slugs = ['wnyc-fm939', 'wnyc-am820', 'q2', 'jonathan-channel', 'special-events-stream', 'wqxr', 'wqxr-special', 'wqxr-special2'];

        //creates an array of stream slugs to display
        const stream_slugs = res_v1_filtered.map((item) => item.slug);
        const fields = ['current-airing.image', 'current-show.show.image', 'current-episode.segments']
        const streams_url = `${config.public.LIVESTREAM_URL}/?filter[slug]=${stream_slugs.join(',')}&include=${fields.join(',')}`;

        const res = await axios(streams_url);
        const resData = await Promise.all(res.data.data.map(async (stream: any) => {
            const streamData = await axios(`${config.public.BFF_URL}/api/whatson/${stream.attributes.slug}`);
            return streamData.data;
        }));
        return humps.camelizeKeys(resData);
    } catch (e) {
        console.error(e);
    }
    return null
}

/**
 * Compress and simplify the global streams data.
 * Reachable /api/streams
 */
export default defineEventHandler(async (event) => {
    let res = event?.node?.res;
    res.setHeader('Cache-Control', 'maxage=120, stale-while-revalidate');
    const streams = await getLivestreams();
    return streams
})