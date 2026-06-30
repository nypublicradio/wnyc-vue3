import axios from 'axios'
import { normalizeNprPage } from '~/composables/data/articlePages'

const config = useRuntimeConfig()

// Get story data from NPR API
const getNprStoryData = async (id: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.NPR_CDS_API}/v1/documents/${id}`,
            headers: {
                Authorization: `Bearer ${process.env.NPR_CDS_API_KEY}`
            },
            timeout: 10000,
        }

        const res = await axios(option)
        return normalizeNprPage(res.data.resources[0])

    } catch (e) {

        if (e.response && e.response.status === 404) {
            console.error('404 = ', e)
        } else {
            console.error(`Error fetching NPR story ${id}:`, e)
        }
    }
    return null
}

// Get story data from CMS

export default defineCachedEventHandler(async (event) => {
    const id: string | undefined = event?.context?.params?.storyId
    if (id) {
        const storyData = await getNprStoryData(id)
        return storyData
    }
    return null
}, {
    maxAge: 300, // 5 minutes
    swr: true,
    shouldBypassCache: () => {
        const config = useRuntimeConfig()
        return config.public.ENV === 'local'
    },
    name: 'npr-story',
    getKey: (event) => `npr-story:${event.context.params.storyId}`
})