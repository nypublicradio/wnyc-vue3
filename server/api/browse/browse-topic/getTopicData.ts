
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
        console.log('error = ', error)
    }
})