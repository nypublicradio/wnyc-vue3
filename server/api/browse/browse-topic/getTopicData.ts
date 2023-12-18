
import axios from 'axios'
import humps from 'humps'

export default defineEventHandler(async (event) => {
    const req = event.req
    const url = new URL(req.headers.referer)
    const params = url.searchParams

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