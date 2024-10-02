
import axios from 'axios'
import humps from 'humps'
import { showTopics } from '~/composables/globals'
import { customAlphabeticalSort } from '~/utilities/helpers';

export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const topic = showTopics.find(topic => topic.value === query.topic);
    try {
        const options = {
            method: 'GET',
            url: topic.url,
        }
        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)

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