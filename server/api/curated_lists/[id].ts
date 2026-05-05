import humps from 'humps'
import { transformCuratedContent } from '~/utilities/curatedContent'

export default defineCachedEventHandler(async (event) => {
    const config = useRuntimeConfig()
    const id = getRouterParam(event, 'id')

    try {
        const res = await $fetch<any>(`${config.public.AVIARY_BASE_API}curated_lists/${id}/`, {
            headers: {
                'X-CMS-Site': config.public.cmsSite,
            },
            timeout: 5000
        })

        const camelized = humps.camelizeKeys(res)
        console.log('camelized', camelized)
        // Wrap the payload in the Wagtail streamfield block structure that transformCuratedContent expects
        const mockCuratedContent = [{
            value: {
                list: {
                    listItems: camelized.listItems
                }
            }
        }]

        const transformed = await transformCuratedContent(mockCuratedContent)
        const normalizedListItems = transformed[0].value.list.listItems

        return normalizedListItems
    } catch (error) {
        console.error(`Failed to fetch curated list ${id}:`, error)
        throw createError({
            statusCode: 500,
            statusMessage: `Failed to fetch curated list ${id}`
        })
    }
}, {
    swr: true,
    maxAge: 300,
    name: 'curated-lists'
})
