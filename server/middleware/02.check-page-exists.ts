import { defineEventHandler, getRequestURL } from 'h3'
import axios from 'axios'

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
    path.startsWith('/sw.js') || // skip service worker
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

  // Use axios with maxRedirects:0 so we see the real status code.
  // $fetch follows redirects by default and returns status 0 for manual redirects,
  // making it impossible to distinguish 301 from 200.
  // Use private aviaryBaseApi (server-only) — never config.public.AVIARY_BASE_API
  // which would leak the internal HTTP URL into the browser's hydration payload.
  const baseApi = config.aviaryBaseApi as string
  const res = await axios.get(`${baseApi}pages/find/`, {
    params: { html_path: path },
    headers: { 'X-CMS-Site': config.public.cmsSite as string },
    maxRedirects: 0,
    validateStatus: () => true, // never throw — we check the status ourselves
  })

  // 2xx = page exists, let Nuxt render it
  if (res.status >= 200 && res.status < 300) {
    return
  }

  // 3xx = Wagtail redirect — throw 404 so NGINX intercepts and proxies to @wagtail,
  // which forwards the redirect to the browser
  if (res.status >= 300 && res.status < 400) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  // 404 = page doesn't exist — throw 404 for NGINX → @wagtail → @missing chain
  if (res.status === 404) {
    throw createError({ statusCode: 404, statusMessage: 'Page Not Found' })
  }

  // Other errors (5xx etc.) — surface them
  throw createError({ statusCode: res.status || 500, statusMessage: 'CMS check failed' })
})
