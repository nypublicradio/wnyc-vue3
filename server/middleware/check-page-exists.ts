import { defineEventHandler, getRequestURL, setResponseStatus } from 'h3'

/**
 * Nitro middleware to check if dynamic pages exist before rendering
 * This runs at the server level BEFORE Vue/Nuxt rendering
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname

  // Only check for dynamic page routes
  // Skip API routes, static assets, and special routes
  // Skip CMS look-up for client-only Nuxt routes.
  // These aren't in the CMS so the fetch would return 404, which cascades into
  // the Nginx @wagtail fallback (appends a trailing slash + leaks port 8080).
  const clientOnlyRoutes = [
    '/',
    '/home',
    '/saved',
    '/login',
    '/signup',
    '/forgot-password',
    '/dashboard',
    '/mobile',
    '/live',
  ]

  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/sw.js') ||
    path.startsWith('/__') || // Nuxt internals
    path.includes('.') || // Files with extensions
    path.startsWith('/confirm') || // email confirmation flow
    path.startsWith('/preview') || // preview pages
    clientOnlyRoutes.includes(path)
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
