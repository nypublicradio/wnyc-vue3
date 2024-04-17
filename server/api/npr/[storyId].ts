import axios from 'axios'
import { normalizeNprPage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

// Get story data from NPR API
const getNprStoryData = async (id: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.NPR_CDS_API}/v1/documents/${id}`,
            headers: {
                Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
            },
        };

        const res = await axios(option);
        //console.log('res= ', res.data.resources[0])
        return normalizeNprPage(res.data.resources[0]);
    } catch (e) {

        if (e.response && e.response.status === 404) {
            console.error('404 = ', e)
        } else {
            console.error(e);
        }
    }
    return null
};

// Get story data from CMS

export default defineEventHandler(async (event) => {
    const id: string | undefined = event?.context?.params?.storyId;
    if (id) {
        const storyData = await getNprStoryData(id);
        return storyData;
    }
    return null
});