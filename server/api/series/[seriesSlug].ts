import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();

// getting series data from the publisher api
// there are no "series" in wagtail, so there is no need to support wagtail here
const getPublisherSeriesData = async (seriesSlug: string) => {
    const res = await axios(`${config.public.PUBLISHER_BASE_API}v3/channel/series/${seriesSlug}`);
    const resData = humps.camelizeKeys(res.data);
    return resData
};

// get series data from CMS
export default defineEventHandler(async (event) => {
    const seriesSlug: string | undefined = event?.context?.params?.seriesSlug;
    if (seriesSlug) {
        const SeriesData = await getPublisherSeriesData(seriesSlug);
        return SeriesData;
    } else {
        return null
    }
});