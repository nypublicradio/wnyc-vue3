import * as Sentry from '@sentry/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const { vueApp } = nuxtApp

  const config = useRuntimeConfig()

  Sentry.init({
    app: [vueApp],
    dsn: config.public.SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration({
        router: nuxtApp.$router,
        enableInp: true,
        interactionsSampleRate: 0.5,
      }),
    ],
    tracesSampleRate: config.public.SENTRY_ENV.toUpperCase() === 'PROD' ? 0.1 : 1.0,
    allowUrls: [
      'https://wnyc.org',
      'https://www.wnyc.org',
      'https://prod.wnyc.org',
      'https://demo.wnyc.org',
      'https://native-app.wnyc.org',
      'https://demo.native-app.wnyc.org',
    ],
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Failed to fetch',
      'NetworkError when attempting to fetch resource.',
      'Load failed',
    ],
    maxValueLength: 1000,
    trackComponents: true,
    timeout: 2000,
    hooks: ['activate', 'mount', 'update'],
    logErrors: true,
    debug: false,
    environment: config.public.SENTRY_ENV,
  })

  // Sentry wraps Nuxt's startup error handler, so Nuxt can't remove it once the app has loaded, and every
  // later Vue error would show the error page. Once loaded, Vue errors are only reported and logged, like Nuxt
  // does on its own (route and fatal errors still show the error page through Nuxt's own handling)
  nuxtApp.hooks.hookOnce('app:suspense:resolve', () => {
    vueApp.config.errorHandler = (error, instance, info) => {
      console.error(`[Vue error in ${info}]`, error)
    }
    // reports to Sentry (with the component and lifecycle hook) before calling the handler above
    Sentry.attachErrorHandler(vueApp, { attachProps: true })
  })

  return {
    provide: {
      sentry: {
        setContext: (n, context) => Sentry.setContext(n, context),
        setUser: user => Sentry.setUser(user),
        setTag: (tagName, value) => Sentry.setTag(tagName, value),
        addBreadcrumb: breadcrumb => Sentry.addBreadcrumb(breadcrumb),
        captureException: exception => Sentry.captureException(exception),
      },
    },
  }
})
