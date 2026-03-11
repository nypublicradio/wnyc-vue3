import axios from 'axios'

// Helper to obtain runtime config
const __getConfig = () => {
  const testCfg = (globalThis as any)?.__testRuntimeConfig
  return testCfg ?? useRuntimeConfig()
}

// Cache redirects for a reasonable time to avoid hitting CMS on every request
const redirectCache = new Map<string, { redirect: string | null, timestamp: number }>()
const CACHE_TTL = 300000 // 5 minutes

// Paths that are definitely Nuxt routes and don't need CMS checks
const SKIP_PATTERNS = [
  /^\/api\//,
  /^\/_nuxt\//,
  /^\/assets\//,
  /^\/images\//,
  /^\/home/,
  /^\/browse/,
  /^\/shows/,
  /^\/story/,
  /^\/listen/,
  /^\/events/,
  /^\/staff/,
  /^\/tags/,
  /^\/preview/,
  /^\/profile/,
  /^\/search/,
  /^\/newsletter/,
  /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp|mp3|mp4)$/,
]

export default defineEventHandler(async (event) => {
  const config = __getConfig()
  const url = event.node.req.url || ''
  const path = url.split('?')[0]
  
  // Skip known Nuxt routes and static assets
  if (SKIP_PATTERNS.some(pattern => pattern.test(path))) {
    return
  }

  // Check cache first
  const cached = redirectCache.get(path)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    if (cached.redirect) {
      // Preserve query params
      const queryString = url.includes('?') ? url.substring(url.indexOf('?')) : ''
      return sendRedirect(event, cached.redirect + queryString, 301)
    }
    return // No redirect needed
  }

  // Check with CMS if this URL should redirect
  try {
    const baseApi = config.public.AVIARY_BASE_API
    if (!baseApi) {
      return // CMS API not configured
    }
    
    const cmsSite = config.cmsSite || 'demo.wnyc.org:443'
    
    const res = await axios.get(`${baseApi}pages/find/`, {
      params: { html_path: path },
      headers: {
        'X-CMS-Site': cmsSite,
        'X-Forwarded-Host': cmsSite,
      },
      maxRedirects: 0,
      validateStatus: () => true,
      timeout: 3000, // 3 second timeout
    })

    // If CMS returns a redirect, cache and execute it
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers?.location
      if (location) {
        // Normalize the location to a path (remove CMS domain if present)
        const redirectPath = location.startsWith('http') 
          ? new URL(location).pathname 
          : location
        
        redirectCache.set(path, { redirect: redirectPath, timestamp: Date.now() })
        
        // Preserve query params
        const queryString = url.includes('?') ? url.substring(url.indexOf('?')) : ''
        return sendRedirect(event, redirectPath + queryString, res.status === 301 ? 301 : 302)
      }
    }

    // Cache that no redirect exists for valid responses
    if (res.status === 200 || res.status === 404) {
      redirectCache.set(path, { redirect: null, timestamp: Date.now() })
    }
  } catch (error: any) {
    // If CMS is unreachable or times out, don't block the request
    // Only log non-timeout errors
    if (error.code !== 'ECONNABORTED' && error.code !== 'ETIMEDOUT') {
      console.error('CMS redirect check failed for', path, ':', error.message)
    }
    return
  }
})
