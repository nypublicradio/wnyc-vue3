import { parseHTML } from 'linkedom'
// convert a tags in html content to nuxtlinks
const convertLinkTags = (htmlContent) => {
    if (htmlContent) {
        const { document } = parseHTML(htmlContent)
        const links = document.querySelectorAll('a')

        links.forEach(link => {
            if (link.href.startsWith('/')) {
                // Internal link, replace with <NuxtLink>
                const nuxtLink = document.createElement('nuxt-link')
                nuxtLink.setAttribute('to', link.href)
                nuxtLink.setAttribute('external', "true")
                nuxtLink.innerHTML = link.innerHTML
                link.replaceWith(nuxtLink)
            } else {
                // External link, set target="_blank"
                link.setAttribute('target', '_blank')
                link.setAttribute('rel', 'noopener noreferrer')
            }
        })

        const processedContent = document.documentElement.outerHTML
        return processedContent
    }
}

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.directive('nuxt-html', {
        mounted(el, binding) {
            console.log('el = ', el)
            console.log('binding = ', binding)
            console.log('convertLinkTags(binding.value) = ', convertLinkTags(binding.value))
            el.innerHTML = binding.value
        },
        getSSRProps(binding) {
            console.log('binding = ', binding)
            // You can provide SSR-specific props here if needed
            return {
                innerHTML: convertLinkTags(binding.value)
            }
        }
    })
})