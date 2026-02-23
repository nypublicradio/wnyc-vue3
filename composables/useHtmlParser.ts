import { h, resolveComponent, type VNode } from 'vue'
import { Parser } from 'htmlparser2'
import VImage from '~/components/VImage.vue'
import { useVImage } from '~/composables/useVImage'

interface HtmlParserOptions {
    tagClassMap?: Record<string, string>
    imagePropsMap?: Record<string, any>
    parentWidth?: number
}

export const useHtmlParser = (htmlString: string, options: HtmlParserOptions = {}): (() => VNode[]) => {
    const { getImageDimensions, templatizeImageUrl } = useVImage()
    const { tagClassMap = {}, imagePropsMap = {}, parentWidth = 304 } = options

    let imageCounter = 0

    const isGif = (imageUrl: string) => {
        const extension = imageUrl.split('.').pop()?.toLowerCase()
        return extension === 'gif'
    }

    const processNodeList = (nodes: any[]): any[] => {
        return nodes.map(node => {
            if (node.type === 'text') {
                return node.data
            }

            if (node.type === 'tag') {
                const tagName = node.name.toLowerCase()
                let attrs = { ...node.attribs }

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
                        const ResolvedNuxtLink = resolveComponent('NuxtLink')
                        return h(ResolvedNuxtLink as any, attrs, () => processNodeList(node.children))
                    }
                    // External links open in new tab
                    attrs.target = '_blank'
                    attrs.rel = 'noopener noreferrer'
                }

                // Render VImage for <img> tags (unless it's a gif)
                if (tagName === 'img' && attrs.src) {
                    if (isGif(attrs.src)) {
                        return h('img', attrs)
                    }

                    const imgDimensions = getImageDimensions(attrs.src)
                    // If we can't parse dimensions, fallback to regular img
                    if (!imgDimensions || imgDimensions.length < 2) {
                        return h('img', attrs)
                    }

                    const imgHeight = Math.round((parentWidth * imgDimensions[1]) / imgDimensions[0])
                    const templatizedSrc = templatizeImageUrl(attrs.src)

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
                    imagePropsMap[srcPropsId] = { template: templatizedSrc }

                    const vImageProps = {
                        src: imagePropsMap[srcPropsId],
                        alt: attrs.alt || '',
                        size: imagePropsMap[sizePropsId],
                        srcset: imagePropsMap[srcsetPropsId],
                        width: imagePropsMap[widthPropsId],
                        height: imagePropsMap[heightPropsId],
                        class: attrs.class
                    }

                    return h(VImage, vImageProps)
                }

                // Skip script tags
                if (tagName === 'script') {
                    return null
                }

                return h(tagName, attrs, node.children ? processNodeList(node.children) : null)
            }
            return null
        }).filter(Boolean)
    }

    const parseToAst = (html: string) => {
        // We import DomHandler from htmlparser2 to easily get an AST
        const { DomHandler } = require('htmlparser2')

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
