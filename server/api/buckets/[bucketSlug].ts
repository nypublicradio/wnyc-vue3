import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();

// getting bucket data from the publisher api
// there are no "buckets" in wagtail, so there is no need to support wagtail here
const getPublisherBucketData = async (bucketSlug: string) => {
    const res = await axios(`${config.public.PUBLISHER_BASE_API}/v3/buckets/${bucketSlug}`);
    const resData = humps.camelizeKeys(res.data);
    return resData
};

// get bucket data from CMS
export default defineEventHandler(async (event) => {
    const bucketSlug: string | undefined = event?.context?.params?.bucketSlug;
    if (bucketSlug) {
        const BucketData = await getPublisherBucketData(bucketSlug);
        return BucketData;
    } else {
        return null
    }
});