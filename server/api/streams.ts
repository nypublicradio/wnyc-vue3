const config = useRuntimeConfig()
import axios from 'axios'
import humps from 'humps'

const getLivestreams = async () => {
    try {
        const stream_slugs = ['wnyc-fm939', 'wnyc-am820', 'q2', 'jonathan-channel', 'special-events-stream', 'wqxr', 'wqxr-special', 'wqxr-special2'];
        const fields = ['current-airing.image', 'current-show.show.image', 'current-episode.segments']
        const streams_url = `${config.public.LIVESTREAM_URL}/?filter[slug]=${stream_slugs.join(',')}&include=${fields.join(',')}`;
        const res = await axios(streams_url);
        const resData = await Promise.all(res.data.data.map(async (stream: any) => {
            const streamData = await axios(`${config.public.BFF_URL}/api/whatson/${stream.attributes.slug}`);
            return streamData.data;
        }));
        return humps.camelizeKeys(resData);
    } catch (e) {
        console.log(e);
    }
}

/**
 * Compress and simplify the global streams data.
 * Reachable /api/streams
 */
export default defineEventHandler(async (event) => {
    const streams = await getLivestreams();
    return streams
})