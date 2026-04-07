import { defineEventHandler, getRequestURL, setResponseStatus } from 'h3'

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
    path.startsWith('/__') ||
    path.endsWith('_payload.json') ||
    path === '/' ||
    path === '/home'
  ) {
    return
  }

  // Reject file-extension paths (e.g. /sw.js) that aren't real static assets
  if (path.includes('.')) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const config = useRuntimeConfig()

  try {
    await $fetch(`${config.public.AVIARY_BASE_API}pages/find/`, {
      query: { html_path: path },
      headers: {
        'X-CMS-Site': config.public.cmsSite,
      },
    })
  } catch (error: any) {
    if (error?.statusCode === 404) {
      setResponseStatus(event, 404, 'Page Not Found')
      return
    }
    throw error
  }
})
