import { normalizeSimplecastListItem, normalizeWagtailListItem, normalizeNprPage } from '~/composables/data/articlePages'

interface NprProfile {
	href: string
	[key: string]: any
}

interface NprAsset {
	isRestrictedToAuthorizedOrgServiceIds?: boolean
	profiles?: NprProfile[]
	[key: string]: any
}

/**
 * Helper to handle NPR CDS items.
 */
async function handleNprCdsItem (listItem: any, componentType: string, showSlug?: string) {
	// Content can be either an object directly or an array with one element
	const nprDocument: NprDocument = listItem.content
		? (Array.isArray(listItem.content) ? listItem.content[0] : listItem.content)
		: null

	// Check if we have a full NPR document with ID
	if (nprDocument?.id) {
		// Check for restricted content
		if (nprDocument.assets) {
			for (const asset of Object.values(nprDocument.assets)) {
				if (asset?.isRestrictedToAuthorizedOrgServiceIds === true) {
					nprDocument.isRestrictedToAuthorizedOrgServiceIds = true
					break
				}
			}
		}

		// Skip if restricted, otherwise normalize
		if (nprDocument.isRestrictedToAuthorizedOrgServiceIds) {
			return null
		}

		return await normalizeNprPage(nprDocument, componentType, showSlug)
	}

	// Handle simple curated NPR items (title, url, image, body directly on listItem)
	const hasTitle = listItem.title && typeof listItem.title === 'string' && listItem.title.trim()
	const hasUrl = listItem.url && typeof listItem.url === 'string' && listItem.url.trim()
	if (hasTitle && hasUrl) {
		return {
			id: listItem.url,
			uuid: listItem.url,
			title: listItem.title,
			description: listItem.subtitle || listItem.body || '',
			tease: listItem.subtitle || listItem.body || '',
			image: listItem.image || null,
			url: listItem.url,
			link: listItem.url,
			cmsSource: 'npr',
			type: 'npr_article',
			body: listItem.body || '',
			rawBody: listItem.body || '',
			meta: {
				slug: listItem.url,
			},
		}
	}

	console.warn('NPR item missing valid title or URL. Title:', listItem.title, 'URL:', listItem.url, 'Keys:', Object.keys(listItem))
	return null
}

/**
 * Helper to handle other content types.
 */
async function handleOtherContentType (listItem: any) {
	const isEventItem = listItem.contentType === 'event_page' || listItem.type === 'event'
	const normalizedImage = listItem.image
		?? listItem.listingImage
		?? listItem.content?.listingImage
		?? listItem.leadAsset?.[0]?.value?.image
		?? listItem.leadAsset?.[0]?.value?.defaultImage

	// Move content properties to root level, keeping existing root properties
	const mergedItem = {
		...listItem.content,
		...listItem,
		...(isEventItem ? { image: listItem.image ?? normalizedImage } : {}),
	}
	delete mergedItem.content

	// For episodes, preserve the original content ID (Simplecast UUID) before merge overrides it
	if (mergedItem.contentType === 'episode' && listItem.content) {
		const simplecastEpisodeId = listItem.content.id || listItem.content.episodeId || listItem.content.uuid
		if (simplecastEpisodeId) {
			mergedItem.episodeId = simplecastEpisodeId
		}
	}

	return mergedItem.contentType === 'episode'
		? await normalizeSimplecastListItem(mergedItem)
		: await normalizeWagtailListItem(mergedItem)
}

interface NprDocument {
	id: string
	assets?: Record<string, NprAsset>
	isRestrictedToAuthorizedOrgServiceIds?: boolean
	[key: string]: any
}

/**
 * Transform curated content by normalizing list items based on their content type.
 * This function:
 * - Merges content properties to the root level of each list item
 * - Normalizes episode content using normalizeSimplecastListItem
 * - Normalizes NPR CDS items using normalizeNprPage
 * - Normalizes other content types using normalizeWagtailListItem
 * 
 * @param curatedContent - Array of curated content items containing lists of items
 * @param componentType - Layout type for image preference (default: "default")
 * @param showSlug - Optional show slug to add to NPR content
 * @returns Transformed curated content with normalized list items
 */
export async function transformCuratedContent (curatedContent: any[], componentType = 'default', showSlug?: string) {
	try {
		return await Promise.all(
			curatedContent.map(async (item) => {
				// Safely check if the item has the expected structure
				if (!item?.value?.list?.listItems || !Array.isArray(item.value.list.listItems)) {
					console.warn('Curated content item missing expected structure:', item)
					return item
				}

				const transformedListItems = await Promise.all(
					item.value.list.listItems.map(async (listItem) => {
						try {
							if (listItem.contentType === 'npr_cds_item') {
								return await handleNprCdsItem(listItem, componentType, showSlug)
							} else {
								return await handleOtherContentType(listItem)
							}
						} catch (error) {
							console.error('Error transforming list item:', error, listItem)
							return null
						}
					})
				)

				// Filter out null items (restricted content or invalid items)
				const filteredListItems = transformedListItems.filter(item => item !== null)

				// Return the curated content item with transformed list items
				return {
					...item,
					value: {
						...item.value,
						list: {
							...item.value.list,
							listItems: filteredListItems
						}
					}
				}
			})
		)
	} catch (error) {
		console.error('Error in transformCuratedContent:', error)
		throw error
	}
}
