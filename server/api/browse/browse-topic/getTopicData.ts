import humps from 'humps'
import { showTopics } from '~/composables/globals'
import { getLegacyDiscoverShows } from '~/server/api/v2/discover/shows'
import { customAlphabeticalSort } from '~/utilities/helpers';

const discoverQueryFromTopicUrl = (url: string) => {
    const searchParams = new URL(url).searchParams

    return Object.fromEntries(searchParams.entries())
}

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const topic = showTopics.find(topic => topic.value === query.topic);
    try {
        const data = await getLegacyDiscoverShows(discoverQueryFromTopicUrl(topic.url))
        const resData = humps.camelizeKeys(data)

        // Sort resData
        resData.sort(customAlphabeticalSort());
        return resData
    } catch (error) {
        console.error('An error occurred:', error.message)
        if (error.response) {
            // The request was made and the server responded with a status code
            console.error('Response data:', error.response.data)
            console.error('Response status:', error.response.status)
            console.error('Response headers:', error.response.headers)
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request)
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request error:', error.message)
        }
        console.error('Config:', error.config)
    }
    return null
})
