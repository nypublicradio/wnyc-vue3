import { cmsSources } from '~/composables/globals'

// Normalize a Wagtail event payload for client consumption.
export const normalizeWagtailEvent = (eventData: any, isList = false) => {
    if (!eventData) return eventData
    const tease = isList ? eventData.listingSummary || eventData.description || null : eventData.description || null
    const title = isList ? eventData.listingTitle || eventData.title : eventData.title
    const image = isList ? eventData.listingImage || eventData.eventImage || eventData.image || null : eventData.eventImage || eventData.image || null
    const fileHash = image?.fileHash
        || image?.meta?.fileHash
        || image?.meta?.file_hash
        || image?.file_hash
        || (image?.id ? String(image.id) : null)
        || image?.meta?.detailUrl
        || image?.meta?.downloadUrl

    const { eventImage, ...rest } = eventData

    return {
        ...rest,
        image: image ? { ...image, fileHash } : null,
        type: 'event',
        cmsSource: cmsSources.WAGTAIL,
        tease,
        title,
    }
}
