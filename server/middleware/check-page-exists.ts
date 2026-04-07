import { defineEventHandler, getRequestURL, setResponseStatus } from 'h3'

/**
 * Nitro middleware to check if dynamic pages exist before rendering
 * This runs at the server level BEFORE Vue/Nuxt rendering
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Only check catch-all [slug] routes against Wagtail CMS.
  // Skip API routes, static assets, Nuxt internals, and all known Nuxt page routes.
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/sw.js') ||
    path.includes('.') || // Files with extensions
    path === '/' ||
    path === '/home' ||
    path.startsWith('/__') || // Nuxt internals
    // Known Nuxt page routes — these fetch data from the BFF, not Wagtail pages/find
    path.startsWith('/browse') ||
    path.startsWith('/events') ||
    path.startsWith('/story') ||
    path.startsWith('/npr') ||
    path.startsWith('/people') ||
    path.startsWith('/staff') ||
    path.startsWith('/archives') ||
    path === '/dashboard' ||
    path === '/saved' ||
    path === '/login' ||
    path === '/signup' ||
    path === '/confirm' ||
    path === '/forgot-password' ||
    path === '/live' ||
    path === '/mobile' ||
    path === '/preview'
  ) {
    return
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
