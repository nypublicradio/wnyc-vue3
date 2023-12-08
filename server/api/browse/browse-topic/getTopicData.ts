
import axios from 'axios'
import humps from 'humps'
//import [useRoute] from '@nuxt'

export default defineEventHandler(async (event) => {
    const req = event.req
    const url = new URL(req.headers.referer)
    const params = url.searchParams

    // const route = useRoute()
    // console.log('route = ', route)

    try {
        const options = {
            method: 'GET',
            url: params.get('url'),
        }
        const res = await axios(options)
        const resData = humps.camelizeKeys(res.data)
        return resData
    } catch (error) {
        console.error('An error occurred:', error.message)
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
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
})