// Server-side error capture. @sentry/node is already a dependency but was never
// initialized, so a Node process crash (e.g. the heap-exhaustion 502 incident) had
// zero visibility outside raw container logs. Nitro funnels request errors and
// process-level unhandledRejection/uncaughtException through the 'error' hook.
import * as Sentry from '@sentry/node'

export default defineNitroPlugin((nitroApp) => {
    const config = useRuntimeConfig()
    const dsn = config.public.SENTRY_DSN

    if (!dsn) {
        return
    }

    Sentry.init({
        dsn,
        environment: config.public.SENTRY_ENV,
        tracesSampleRate: 0,
    })

    nitroApp.hooks.hook('error', (error) => {
        Sentry.captureException(error)
    })
})
