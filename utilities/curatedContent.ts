import { normalizeSimplecastListItem, normalizeWagtailListItem, normalizeNprPage } from '~/composables/data/articlePages'

interface NprAsset {
	isRestrictedToAuthorizedOrgServiceIds?: boolean
	profiles?: Array<{ href?: string }>
	[key: string]: any
}

interface NprDocument {
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
 * @returns Transformed curated content with normalized list items
 */
export async function transformCuratedContent(curatedContent: any[], componentType = 'default') {
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
							// Handle NPR CDS items specially
							if (listItem.contentType === 'npr_cds_item') {
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
									
									return await normalizeNprPage(nprDocument, componentType)
								}
								
								// Handle simple curated NPR items (title, url, image, body directly on listItem)
							// Check for truthy values (not just existence of keys)
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
							
							// If neither full document nor simple structure, skip this item
							console.warn('NPR item missing valid title or URL. Title:', listItem.title, 'URL:', listItem.url, 'Keys:', Object.keys(listItem))
						return null
					}
					
					// Handle other content types
					// Move content properties to root level, keeping existing root properties
					const mergedItem = { ...listItem.content, ...listItem }
					delete mergedItem.content

					return mergedItem.contentType === 'episode'
						? await normalizeSimplecastListItem(mergedItem)
						: await normalizeWagtailListItem(mergedItem)
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
