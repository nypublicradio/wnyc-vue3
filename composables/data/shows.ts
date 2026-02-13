import { cmsSources, mediaTypes, FALLBACKIMAGE } from '~/composables/globals'
import { useVImage } from '~/composables/useVImage'

const { templatizeImageUrl } = useVImage()

/**
 * Normalize a Wagtail show for list display
 * @param show - Raw show data from Wagtail API
 * @returns Normalized show object
 */
export function normalizeWagtailShow(show: any) {
    // Extract show image URL
    const showImageUrl = show.showArt?.url || show.showArt?.renditions?.find((r: any) => r.name === 'small')?.url || '/fallback-ep.png'
    const imageTemplate = showImageUrl ? templatizeImageUrl(showImageUrl) : showImageUrl
    
    return {
        id: show.id,
        title: show.title,
        slug: show.meta?.slug || '',
        description: show.description,
        topperDisplayTitle: show.topperDisplayTitle,
        linkedDataSource: show.linkedDataSource,
        showArt: show.showArt,
        showLogo: show.showLogo,
        topperBackground: show.topperBackground,
        inPageNavigation: show.inPageNavigation,
        body: show.body,
        aboutModule: show.aboutModule,
        canDownloadEpisodes: show.canDownloadEpisodes,
        canEmbedEpisodes: show.canEmbedEpisodes,
        image: {
            url: showImageUrl,
            template: imageTemplate
        },
        cmsSource: cmsSources.WAGTAIL,
        type: show.meta?.type || 'shows.ShowPage',
        url: show.meta?.htmlUrl || `/browse/shows/${show.meta?.slug}`,
    }
}

/**
 * Normalize a Wagtail show for detailed display
 * @param show - Raw show data from Wagtail API
 * @param slug - Show slug (fallback)
 * @returns Normalized show object with additional detail fields
 */
export function normalizeWagtailShowDetail(show: any, slug?: string) {
    // Normalize show image
    const showImageUrl = show.showArt?.url || show.showArt?.renditions?.find((r: any) => r.name === 'small')?.url
    const imageTemplate = showImageUrl ? templatizeImageUrl(showImageUrl) : undefined
    
    return {
        id: show.id,
        title: show.title,
        slug: show.meta?.slug || slug || '',
        description: show.description,
        topperDisplayTitle: show.topperDisplayTitle,
        linkedDataSource: show.linkedDataSource,
        showArt: show.showArt,
        showLogo: show.showLogo,
        topperBackground: show.topperBackground,
        inPageNavigation: show.inPageNavigation,
        body: show.body,
        aboutModule: show.aboutModule,
        canDownloadEpisodes: show.canDownloadEpisodes,
        canEmbedEpisodes: show.canEmbedEpisodes,
        image: showImageUrl ? { 
            url: showImageUrl, 
            template: imageTemplate 
        } : { url: FALLBACKIMAGE, template: FALLBACKIMAGE },
        cmsSource: cmsSources.WAGTAIL,
        type: mediaTypes.SHOW,
        url: show.meta?.htmlUrl || `/browse/shows/${slug || show.meta?.slug}`,
    }
}
