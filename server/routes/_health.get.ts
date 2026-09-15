// Liveness check for the app process itself. Nginx proxies /_health here instead of
// answering it directly, so a dead/crash-looping Node process is actually detected.
// Must stay free of any CMS/Supabase/network I/O so it only ever reflects process health.
export default defineEventHandler((event) => {
    setResponseHeader(event, 'Cache-Control', 'no-store')
    return { status: 'ok' }
})
