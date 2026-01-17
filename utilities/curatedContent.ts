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
	return await Promise.all(
		curatedContent.map(async (item) => {
			const transformedListItems = await Promise.all(
				item.value.list.listItems.map(async (listItem) => {
					// Handle NPR CDS items specially
					if (listItem.contentType === 'npr_cds_item' && listItem.content && listItem.content.length > 0) {
						const nprDocument: NprDocument = listItem.content[0]
						
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
						if (nprDocument?.isRestrictedToAuthorizedOrgServiceIds) {
							return null
						}
						
						return await normalizeNprPage(nprDocument, componentType)
					}
					
					// Handle other content types
					// Move content properties to root level, keeping existing root properties
					const mergedItem = { ...listItem.content, ...listItem }
					delete mergedItem.content

					return mergedItem.contentType === 'episode'
						? await normalizeSimplecastListItem(mergedItem)
						: await normalizeWagtailListItem(mergedItem)
				})
			)

			// Filter out null items (restricted content)
			const filteredListItems = transformedListItems.filter(item => item !== null)

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
}
