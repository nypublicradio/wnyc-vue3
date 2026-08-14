// TEMPORARY DEBUG PLUGIN - Remove after diagnosing white screen issue
// This captures all JS errors and shows them visually on screen
export default defineNuxtPlugin((nuxtApp) => {
  // Create a visible debug panel
  const debugDiv = document.createElement('div')
  debugDiv.id = 'debug-panel'
  debugDiv.style.cssText = 'position:fixed;bottom:0;left:0;right:0;max-height:50vh;overflow:auto;background:red;color:white;font-size:12px;padding:8px;z-index:999999;font-family:monospace;white-space:pre-wrap;'
  debugDiv.textContent = '🔍 Debug panel active\n'
  document.body.appendChild(debugDiv)

  const log = (msg) => {
    const time = new Date().toISOString().slice(11, 23)
    debugDiv.textContent += `[${time}] ${msg}\n`
    debugDiv.scrollTop = debugDiv.scrollHeight
    console.log(`[DEBUG] ${msg}`)
  }

  log(`Platform: ${window.Capacitor?.getPlatform?.() || 'unknown'}`)
  log(`URL: ${location.href}`)
  log(`UA: ${navigator.userAgent.slice(0, 80)}`)

  // Catch all unhandled errors
  window.addEventListener('error', (e) => {
    log(`ERROR: ${e.message} at ${e.filename}:${e.lineno}:${e.colno}`)
  })

  // Catch unhandled promise rejections
  window.addEventListener('unhandledrejection', (e) => {
    log(`REJECTION: ${e.reason?.message || e.reason || 'unknown'}`)
  })

  // Track navigation
  nuxtApp.hook('page:start', () => log('page:start'))
  nuxtApp.hook('page:finish', () => log('page:finish'))
  nuxtApp.hook('app:error', (err) => log(`app:error: ${err?.message || err}`))
  nuxtApp.hook('vue:error', (err) => log(`vue:error: ${err?.message || err}`))

  log('Debug plugin initialized')
})
