import { defineEventHandler, getRequestURL } from 'h3'

/**
 * Nitro middleware to check if dynamic pages exist before rendering
 * This runs at the server level BEFORE Vue/Nuxt rendering
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Skip API routes, static assets, and Nuxt internals
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/_ipx/') ||
    path.startsWith('/__') ||
    path === '/' ||
    path === '/home'
  ) {
    return
  }

  // File-like paths (fonts, _payload.json, images, etc.)
  // Let Nitro handle them — static files are already served before middleware,
  // and _payload.json is generated dynamically by Nuxt's renderer.
  // [slug].vue validate() handles rejecting invalid slugs at the route level.
  if (path.includes('.')) {
    return
  }

  const config = useRuntimeConfig()

  try {
    await $fetch.raw(`${config.public.AVIARY_BASE_API}pages/find/`, {
      query: { html_path: path },
      headers: {
        'X-CMS-Site': config.public.cmsSite,
      },
      redirect: 'manual', // Don't follow redirects — let NGINX handle them via @wagtail
    })
  } catch (error: any) {
    if (error?.statusCode === 404) {
      // Throw a real 404 so NGINX intercepts it and proxies to Wagtail,
      // which handles CMS-defined redirects before falling through to @missing.
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
    // Redirect responses (301/302) with redirect:'manual' cause $fetch to throw.
    // Treat them as "not found here" so NGINX proxies to @wagtail for the redirect.
    if (error?.status >= 300 && error?.status < 400) {
      throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
    }
    throw error
  }
})
