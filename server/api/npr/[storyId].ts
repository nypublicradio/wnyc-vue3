import axios from 'axios'
import humps from 'humps'
import { normalizeNprPage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

const getNprStoryData = async (id: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.NPR}documets/${id}`,
        };
        const res = await axios(option);
        return normalizeNprPage(res.data);
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
    const id: string | undefined = event?.context?.params?.slug;
    console.log("id = ", id)
    if (id) {
        const storyData = await getNprStoryData(id);
        return storyData;
    }
    return null
});