import * as Sentry from '@sentry/vue'
import { HttpClient } from '@sentry/integrations'

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
      new HttpClient(),
      new Sentry.Replay({
        maskAllText: false,
        blockAllMedia: false
      }),
    ],
    tracesSampleRate: config.public.SENTRY_ENV.toUpperCase() === 'PROD' ? 0.1 : 1.0,
    replaysSessionSampleRate: config.public.SENTRY_ENV.toUpperCase() === 'PROD' ? 0.0005 : 1.0,
    replaysOnErrorSampleRate: config.public.SENTRY_ENV.toUpperCase() === 'PROD' ? 0.001 : 1.0,
    allowUrls: [
      'https://native-app.wnyc.org',
      'https://demo.native-app.wnyc.org',
      'http://local.dev.nypr.digital:3000',
      'capacitor://localhost',
    ],
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Failed to fetch',
      'NetworkError when attempting to fetch resource.',
      'Load failed',
    ],
    tracePropagationTargets: ['cms.demo.nypr.digital', 'api.demo.nypr.digital', 'cms.prod.nypr.digital', 'api.prod.nypr.digital', 'api.wnyc.org', 'www.wnyc.org'],
    maxValueLength: 1000,
    trackComponents: true,
    timeout: 2000,
    hooks: ['activate', 'mount', 'update'],
    logErrors: true,
    debug: false,
    environment: config.public.SENTRY_ENV,
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