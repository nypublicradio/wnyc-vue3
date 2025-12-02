import { cmsSources } from '~/composables/globals'

// Normalize a Wagtail event payload for client consumption.
export const normalizeWagtailEvent = (eventData: any) => {
    if (!eventData) return eventData

    const tease = eventData.description ?? null

    const image = eventData.eventImage ?? eventData.image ?? null
    const fileHash = image?.fileHash
        ?? image?.meta?.fileHash
        ?? image?.meta?.file_hash
        ?? image?.file_hash
        ?? (image?.id ? String(image.id) : null)
        ?? image?.meta?.detailUrl
        ?? image?.meta?.downloadUrl

    const { eventImage, ...rest } = eventData

    return {
        ...rest,
        image: image ? { ...image, fileHash } : null,
        type: 'event',
        cmsSource: cmsSources.WAGTAIL,
        tease,
    }
}
