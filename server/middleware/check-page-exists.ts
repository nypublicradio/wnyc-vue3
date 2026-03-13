import { defineEventHandler, getRequestURL, setResponseStatus } from 'h3'

/**
 * Nitro middleware to check if dynamic pages exist before rendering
 * This runs at the server level BEFORE Vue/Nuxt rendering
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const path = url.pathname
  
  console.log('[check-page-exists] Intercepting request:', path)
  
  // Only check for dynamic page routes
  // Skip API routes, static assets, and special routes
  if (
    path.startsWith('/api/') ||
    path.startsWith('/_nuxt/') ||
    path.startsWith('/sw.js') ||
    path.includes('.') || // Files with extensions
    path === '/' || // Home page
    path === '/home' || // Common home page alias
    path.startsWith('/__') // Nuxt internals
  ) {
    console.log('[check-page-exists] Skipping check for:', path)
    return
  }
  
  console.log('[check-page-exists] Checking if page exists:', path)
  
  // Get runtime config
  const config = useRuntimeConfig()
  
  try {
    // Check if the page exists in CMS
    const response = await $fetch(`${config.public.AVIARY_BASE_API}pages/find/`, {
      query: { html_path: path },
      headers: {
        'X-CMS-Site': config.cmsSite || 'demo.wnyc.org:443',
      },
    })
    
    console.log('[check-page-exists] Page FOUND:', path)
    // Page exists, let it render normally
    return
  } catch (error: any) {
    console.log('[check-page-exists] Error checking page:', path, 'Status:', error?.statusCode)
    
    if (error?.statusCode === 404) {
      console.log('[check-page-exists] Page NOT FOUND - Setting 404 status for:', path)
      
      // Set 404 status - nginx will see this
      setResponseStatus(event, 404, 'Page Not Found')
      
      // Let Nuxt continue to render error page, but response will have 404 status
      return
    }
    
    // For other errors, let them bubble up
    throw error
  }
})
