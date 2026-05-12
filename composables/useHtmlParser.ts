import { h, resolveComponent, type VNode } from 'vue'
import { Parser, DomHandler } from 'htmlparser2'
import VImage from '~/components/VImage.vue'
import { useVImage } from '~/composables/useVImage'
import { WAGTAILIMAGEDOMAINSOURCES } from '~/composables/globals'

interface HtmlParserOptions {
    tagClassMap?: Record<string, string>
    imagePropsMap?: Record<string, any>
    parentWidth?: number
    NuxtLink?: any
}
// composable that will parse the html string into an ast
export const useHtmlParser = (htmlString: string, options: HtmlParserOptions = {}): (() => VNode[]) => {
    const { getImageDimensions, templatizeImageUrl, isPublisherImageUrl, isNPRImageUrl } = useVImage()
    const { tagClassMap = {}, imagePropsMap = {}, parentWidth = 304 } = options

    let imageCounter = 0
    // check if the image is a gif
    const isGif = (imageUrl: string) => {
        const extension = imageUrl.split('.').pop()?.toLowerCase()
        return extension === 'gif'
    }
    // get the wagtail image id from the url
    const getWagtailImageId = (url: string): string | null => {
        if (typeof url !== 'string') return null
        const match = url.match(/\/images\/(\d+)\//)
        return match ? match[1] : null
    }
    // format the NPR image url to be used by VImageNpr.vue
    const formatNPRImageUrl = (url: string): string => {
        if (typeof url !== 'string') return url
        // Converts static API values (.../resize/1184/quality/80/format/jpg/...) into
        // the dynamic template expected by VImageNpr.vue (.../resize/{width}/quality/{quality}/format/{format}/...)
        return url.replace(
            /\/resize\/\d+\/quality\/\d+\/format\/[a-zA-Z0-9]+\//i,
            '/resize/{width}/quality/{quality}/format/{format}/'
        )
    }
    // process the ast nodes and return a VNode
    const processNodeList = (nodes: any[]): any[] => {
        return nodes.map(node => {
            if (node.type === 'text') {
                return node.data
            }

            if (node.type === 'tag') {
                const tagName = node.name.toLowerCase()
                const attrs = { ...node.attribs }

                // Apply custom classes from tagClassMap
                if (tagClassMap[tagName]) {
                    attrs.class = `${attrs.class || ''} ${tagClassMap[tagName]}`.trim()
                }

                // Render NuxtLink for <a> tags with relative URLs
                if (tagName === 'a' && attrs.href) {
                    const isInternal = !attrs.href.startsWith('http')
                    if (isInternal) {
                        attrs.to = attrs.href
                        delete attrs.href
                        const NuxtLinkComponent = options.NuxtLink || resolveComponent('NuxtLink')
                        return h(NuxtLinkComponent as any, attrs, () => processNodeList(node.children))
                    }
                    // External links open in new tab
                    attrs.target = '_blank'
                    attrs.rel = 'noopener noreferrer'
                }

                // Render VImage for <img> tags (unless it's a gif)
                if (tagName === 'img' && attrs.src) {
                    attrs.style = `${attrs.style || ''}; width: 100%;`.replace(/^;\s*/, '').trim()

                    if (isGif(attrs.src)) {
                        return h('img', attrs)
                    }

                    const imgDimensions = getImageDimensions(attrs.src)
                    // If we can't parse dimensions, fallback to regular img
                    if (!imgDimensions || imgDimensions.length < 2) {
                        return h('img', attrs)
                    }

                    const imgHeight = Math.round((parentWidth * imgDimensions[1]) / imgDimensions[0])

                    const templatizedSrc = attrs.src.includes(WAGTAILIMAGEDOMAINSOURCES[0]) ? getWagtailImageId(attrs.src) : isPublisherImageUrl(attrs.src) ? { template: templatizeImageUrl(attrs.src) } : isNPRImageUrl(attrs.src) ? formatNPRImageUrl(attrs.src) : attrs.src
                    //console.log('templatizedSrc', templatizedSrc)
                    const sizePropsId = `imageSize${imageCounter}`
                    const srcsetPropsId = `imageSrcset${imageCounter}`
                    const widthPropsId = `imageWidth${imageCounter}`
                    const heightPropsId = `imageHeight${imageCounter}`
                    const srcPropsId = `imageSrc${imageCounter}`
                    imageCounter++

                    imagePropsMap[sizePropsId] = imgDimensions
                    imagePropsMap[srcsetPropsId] = [1, 2]
                    imagePropsMap[widthPropsId] = parentWidth
                    imagePropsMap[heightPropsId] = imgHeight
                    imagePropsMap[srcPropsId] = templatizedSrc

                    const vImageProps = {
                        src: imagePropsMap[srcPropsId],
                        alt: attrs.alt || '',
                        size: { xs: [parentWidth, imgHeight] },
                        srcset: imagePropsMap[srcsetPropsId],
                        width: imagePropsMap[widthPropsId],
                        height: imagePropsMap[heightPropsId],
                        class: attrs.class
                    }

                    return h(VImage, vImageProps)
                }

                // Intercept iframes and rewrite WNYC widget URLs to use local Nuxt routes
                if (tagName === 'iframe' && attrs.src) {
                    if (attrs.src.includes('wnyc.org/widgets/')) {
                        try {
                            const urlObj = new URL(attrs.src)
                            attrs.src = urlObj.pathname + urlObj.search + urlObj.hash
                        } catch (e) {
                            // ignore invalid URLs
                        }
                    }
                    return h(tagName, attrs, node.children ? processNodeList(node.children) : null)
                }

                // Skip script tags
                if (tagName === 'script') {
                    return null
                }

                return h(tagName, attrs, node.children ? processNodeList(node.children) : null)
            }

            return null // Default return for unhandled node types (e.g., comments)
        }).filter(Boolean)
    }
    // function that will parse the html string into an ast
    const parseToAst = (html: string) => {
        let astNodes: any[] = []
        const handler = new DomHandler((error, dom) => {
            if (error) {
                console.error('HTML parsing error', error)
            } else {
                astNodes = dom
            }
        })
        const parser = new Parser(handler)
        parser.write(html)
        parser.end()

        return astNodes
    }

    // Return a render function that Vue can execute inside <component :is="...">
    return () => {
        if (!htmlString || typeof htmlString !== 'string') return []

        // Clean up html first
        const cleanedHtml = htmlString
            .replace(/<p>&nbsp;<\/p>/g, "")
            .replace(/<p>(.*?)<\/p>/g, (match, content) => {
                return content.includes("<script") ? "" : match
            })

        const ast = parseToAst(cleanedHtml)
        return processNodeList(ast)
    }
}
