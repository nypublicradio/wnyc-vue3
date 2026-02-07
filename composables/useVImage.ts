import {
    cmsSources,
    NPRIMAGEDOMAINSOURCES,
} from "~/composables/globals"

interface ImageAttributes {
    imageMain?: {
        template: string
    }
    image?: {
        template: string
    }
}

export function useVImage () {

    /*
    formats the url of a publisher image so it works with our design system image components
    */
    const formatPublisherImageUrl = (url) => {
        return url.replace("%s/%s/%s/%s", "%width%/%height%/c/%quality%")
    }


    // method to format the url to get the raw image
    const formatRawPublisherImageUrl = (url) => {
        return url.replace("%s/%s/%s/%s", "raw")
    }

    /*
    finds the image first then formats the url of a publisher image so it works with our design system image components
    */
    const formatPublisherImage = (attributes) => {
        const img = attributes.imageMain ?? attributes.image
        const url = img.template
        return url.replace("%s/%s/%s/%s", "%width%/%height%/c/%quality%")
    }

    // returns a resized image url when provided the entire image object
    const resizePublisherImage = (
        attributes: ImageAttributes,
        w: number,
        h: number,
        q = 80
    ): string => {
        const img = attributes.imageMain ?? attributes.image
        const url = img.template

        const pieces = url.split("/")
        const finalUrlArr: string[] = []

        pieces.forEach((piece: string, index: number) => {
            if (index < 4 || index > 7) {
                finalUrlArr.push(piece)
            }
            if (index === 4) {
                finalUrlArr.push(`${w}/${h}/c/${q}`)
            }
        })
        return finalUrlArr.join("/")
    }

    // returns a resized image url when provided just the image URL
    const resizePublisherImageUrl = (
        url: string,
        w: number,
        h: number,
        q = 80
    ): string => {
        const pieces = url.split("/")
        const finalUrlArr: string[] = []

        pieces.forEach((piece: string, index: number) => {
            if (index < 4 || index > 7) {
                finalUrlArr.push(piece)
            }
            if (index === 4) {
                finalUrlArr.push(`${w}/${h}/c/${q}`)
            }
        })
        return finalUrlArr.join("/")
    }

    // returns a resized image url when provided just the image URL
    const resizeNprImageUrl = (
        url: string,
        w: number,
        q = 80,
        format = "jpeg"
    ): string => {
        const finalUrl = url.replace('{width}', w.toString()).replace('{format}', format).replace('{quality}', q.toString())
        return finalUrl
    }

    // returns a resized image url when provided just the image URL
    const resizeWagtailImageUrl = (
        id: string,
        w: number,
        h: number,
        q = 80,
        format = "jpeg"
    ): string => {
        const config = useRuntimeConfig()
        const finalUrl = `${config.public.IMAGE_BASE_URL}${id}/fill-${w}x${h}-c0|format-${format}|${format}quality-${q}`
        return finalUrl
    }

    // central spot to handle image formatting from diff sources
    const imageSolver = (url: string, options: { w?: number, h?: number, q?: number, format?: string } = {}) => {
        // Default values for width, height, quality, and format
        const { w = 288, h = 288, q = 80, format = "jpeg" } = options

        let imgUrl = ""
        if (typeof url === "string" && /^\d+$/.test(url)) {
            imgUrl = resizeWagtailImageUrl(url, w, h, q, format)
        } else if (typeof url === "string" && url.includes("media.wnyc.org")) {
            imgUrl = resizePublisherImageUrl(url, w, h, q)
        } else if (
            typeof url === "string" &&
            Array.isArray(NPRIMAGEDOMAINSOURCES) &&
            NPRIMAGEDOMAINSOURCES.some(domain => url.includes(domain))
        ) {
            imgUrl = resizeNprImageUrl(url, w, q, format)
        } else {
            imgUrl = url
        }
        return imgUrl
    }

    // returns a templated NPR image url when provided just the image URL
    const templatizeNPRImageUrl = (url: string): string => {
        return url.replace('{width}', '%s').replace('{height}', '%s').replace('{quality}', '%s').replace('{format}', '%s')

    }
    // returns a templated Wagtail image url when provided just the image URL
    const templatizeWagtailImageUrl = (url: string): string => {

        // formatted :https://cms.prod.nypr.digital/images/352462/fill-592x395-c0|format-webp|webpquality-80
        return url.replace(/fill-(\d+)x(\d+)-c0/, 'fill-%s/%s/c0').replace(/format-[a-zA-Z]+/, 'format-%s').replace(/(webp|jpeg|jpg|png)quality-(\d+)/, '%squality-%s')

    }
    // returns a templated PUBLISHER image url when provided just the image URL
    const templatizePublisherImageUrl = (url: string): string => {
        const pieces = url.split("/")
        const finalUrlArr: string[] = []

        pieces.forEach((piece: string, index: number) => {
            if (index < 4 || index > 7) {
                finalUrlArr.push(piece)
            }
            if (index === 4) {
                finalUrlArr.push("%s/%s/%s/%s")
            }
        })
        return finalUrlArr.join("/")
    }

    // checks if the image is from Wagtail
    const isWagtailImage = (srcImg) => {
        return (typeof srcImg === "object" && "fileHash" in srcImg) || /^\d+$/.test(srcImg)
    }

    // checks if the image URL is from Wagtail
    const isSimplecastImage = (url) => {
        // Handle both string URLs and objects with url property
        if (typeof url === "string" && url.includes("simplecastcdn.com")) {
            return true
        }
        if (typeof url === "object" && url?.url && typeof url.url === "string" && url.url.includes("simplecastcdn.com")) {
            return true
        }
        return false
    }

    // checks if the image is from Publisher
    const isPublisherImage = (srcImg) => {
        return (typeof srcImg === "object" && srcImg?.template?.includes("media.wnyc.org"))
    }
    // checks if the image is from NPR
    const isNPRImage = (srcImg) => {
        return NPRIMAGEDOMAINSOURCES.some((domain) => (typeof srcImg === "object" && srcImg?.template?.includes(domain)) || (typeof srcImg === "string" && srcImg?.includes(domain)))
    }
    // checks if the image URL is from Wagtail
    const isWagtailImageUrl = (url) => {
        return (typeof url === "string" && url.includes("nypr.digital/images"))
    }
    // checks if the image URL is from Simplecast
    // const isSimplecastImageUrl = (url) => {
    //     return (typeof url === "string" && url.includes("simplecastcdn.com"))
    // }
    // checks if the image URL is from Publisher
    const isPublisherImageUrl = (url) => {
        return (typeof url === "string" && url.includes("media.wnyc.org"))
    }
    // checks if the image URL is from NPR
    const isNPRImageUrl = (url) => {
        return NPRIMAGEDOMAINSOURCES.some((domain) => ((typeof url === "string" && url?.includes(domain))))
    }
    // returns a templatized image URL based on the source
    const templatizeImageUrl = (url) => {
        // determine where the image src is from and return the templatized url
        if (isWagtailImageUrl(url)) {
            return templatizeWagtailImageUrl(url)
        } else if (isPublisherImageUrl(url)) {
            return templatizePublisherImageUrl(url)
        } else if (isNPRImageUrl(url)) {
            return templatizeNPRImageUrl(url)
        } else {
            return url
        }
    }

    // determines the CMS source of an image and returns the cmsSource and image template or id
    const getCmsSourceAndImageTemplate = (srcImg, fallback) => {
        const fallBackObject = { cmsSource: cmsSources.WAGTAIL, imageTemplate: fallback }
        if (srcImg) {
            // check if fileHash exists, or if we pass in a fallback, they are provided as just strings numbers from Wagtail
            if (isWagtailImage(srcImg)) {
                return { cmsSource: cmsSources.WAGTAIL, imageTemplate: srcImg?.id || String(srcImg) }
            } else if (isPublisherImage(srcImg)) {
                return { cmsSource: cmsSources.PUBLISHER, imageTemplate: srcImg.template }
            } else if (isNPRImage(srcImg)) {
                return { cmsSource: cmsSources.NPR, imageTemplate: srcImg?.template || srcImg }
            } else if (isSimplecastImage(srcImg)) {
                // Handle Simplecast images - extract URL from object or use string directly
                const imageUrl = typeof srcImg === "object" && srcImg?.url ? srcImg.url : srcImg
                return { cmsSource: cmsSources.SIMPLECAST, imageTemplate: imageUrl }
            } else {
                // fallback
                return fallBackObject
            }
        } else {
            // fallback
            return fallBackObject
        }
    }

    // central spot to get the images native width and height for layout purposes
    const getImageDimensions = (url: string) => {

        let dim = [0, 0]
        if (typeof url === "string" && /^\d+$/.test(url)) {
            //https://cms.prod.nypr.digital/images/352442/fill-592x395-c0|format-webp|webpquality-80
            // Extract width and height from Wagtail URLs
            const fillMatch = url.match(/fill-(\d+)x(\d+)/)
            dim = fillMatch ? [parseInt(fillMatch[1]), parseInt(fillMatch[2])] : [0, 0]

        } else if (typeof url === "string" && url.includes("media.wnyc.org")) {
            //https://media.wnyc.org/i/165/40/l/80/2022/11/EN_ListenAFOn_AmazonMusic_button_Indigo_RGB.png
            const pathParts = url.split("/i/")[1]?.split("/")
            dim = pathParts && pathParts.length >= 2 ? [parseInt(pathParts[0]), parseInt(pathParts[1])] : [0, 0]
        } else if (
            typeof url === "string" &&
            Array.isArray(NPRIMAGEDOMAINSOURCES) &&
            NPRIMAGEDOMAINSOURCES.some(domain => url.includes(domain))
        ) {
            //https://npr.brightspotcdn.com/dims3/default/strip/false/crop/908x681+58+0/resize/390/quality/80/format/jpg/?url=http%3A%2F%2Fnpr-brightspot.s3.amazonaws.com%2Fb4%2Ff6%2Fe386e5e34eb3bde3acf3b9c1f4d7%2Fgettyimages-2225247729.jpg
            const cropMatch = url.match(/\/crop\/(\d+)x(\d+)/)
            dim = cropMatch ? [parseInt(cropMatch[1]), parseInt(cropMatch[2])] : [0, 0]
        }
        return dim as [number, number]
    }



    return {
        formatPublisherImageUrl,
        formatRawPublisherImageUrl,
        formatPublisherImage,
        getImageDimensions,
        getCmsSourceAndImageTemplate,
        templatizeImageUrl,
        resizePublisherImage,
        resizePublisherImageUrl,
        resizeNprImageUrl,
        resizeWagtailImageUrl,
        imageSolver,
        templatizeNPRImageUrl,
        templatizeWagtailImageUrl,
        templatizePublisherImageUrl,
        isWagtailImage,
        isPublisherImage,
        isNPRImage,
        isWagtailImageUrl,
        isPublisherImageUrl,
        isNPRImageUrl
    }
}
