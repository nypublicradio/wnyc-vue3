import type { ArticlePage } from '../types/Page'
import { normalizeNprPage } from './articlePages'

/**
 * Process curated NPR CDS items from CMS curated content
 * Extracts items with contentType === "npr_cds_item", checks for restrictions,
 * and normalizes them using the same logic as getNprStories
 * 
 * @param curatedContent - Array of curated content from CMS
 * @param componentType - Layout type for image preference (default: "default")
 * @returns Array with structure matching getNprStories: [{ componentType, articles }]
 */
export async function processCuratedNprItems(
	curatedContent: any[],
	componentType: string = "default"
): Promise<{ componentType: string; articles: ArticlePage[] }[] | null> {
	try {
		// Extract all NPR CDS items from curated content
		const nprCdsItems: any[] = []
		
		for (const curatedItem of curatedContent) {
			// Check if this is a curated_list type
			if (curatedItem.type === 'curated_list' && curatedItem.value?.list?.listItems) {
				// Iterate through list items
				for (const listItem of curatedItem.value.list.listItems) {
					// Check if contentType is npr_cds_item and has content
					if (listItem.contentType === 'npr_cds_item' && listItem.content && listItem.content.length > 0) {
						// Extract the NPR CDS document from content[0]
						const nprDocument = listItem.content[0]
						if (nprDocument) {
							nprCdsItems.push(nprDocument)
						}
					}
				}
			}
		}

		// If no NPR CDS items found, return null
		if (nprCdsItems.length === 0) {
			return null
		}

		// Process NPR CDS items similar to getNprStories
		const normalizeArticles = await Promise.all(nprCdsItems.map((article) => {
			// Check for restricted content
			if (article.assets) {
				for (const asset of Object.values(article.assets)) {
					if ((asset as any)?.isRestrictedToAuthorizedOrgServiceIds === true) {
						article.isRestrictedToAuthorizedOrgServiceIds = true
						break
					}
				}
			}
			
			// Remove article if it contains restricted content
			if (article?.isRestrictedToAuthorizedOrgServiceIds) {
				return null
			} else {
				return normalizeNprPage(article, componentType)
			}
		}))

		// Remove null and undefined articles
		const cleanedArticles = normalizeArticles.filter((article) => article !== undefined && article !== null)
		
		// Remove articles with no body content or empty body content
		const filteredArticles = cleanedArticles.filter((article) => article!.body !== null && article!.body !== '')

		// Return in the same structure as getNprStories
		return [{
			componentType,
			articles: filteredArticles as ArticlePage[]
		}]
	} catch (e) {
		console.error('processCuratedNprItems = ', e)
		return null
	}
}
