import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig()

/**
 * Fetches document data from the Wagtail CMS API by ID.
 */
const getWagtailDocumentById = async (documentId: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.AVIARY_BASE_API}documents/${documentId}/`,
            headers: {
                'X-CMS-Site': config.public.cmsSite
            }
        }
        const res = await axios(option)
        return humps.camelizeKeys(res.data)
    } catch (e) {
        if (e.response && e.response.status === 404) {
            console.error('document not found:', documentId)
        } else {
            console.error('Error fetching document:', e)
        }
    }
    return null
}

export default defineEventHandler(async (document) => {
    setResponseHeader(document, 'Cache-Control', 'max-age=300, stale-while-revalidate=600')
    const documentId: string | undefined = document?.context?.params?.documentId

    if (documentId) {

        const res = document?.node?.res
        res.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')

        const documentData = await getWagtailDocumentById(documentId)
          .then(data => humps.camelizeKeys(data))
        return  documentData
    }

    return null
})
