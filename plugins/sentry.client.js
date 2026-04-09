import * as Sentry from '@sentry/vue'
import { HttpClient } from '@sentry/integrations'

export default defineNuxtPlugin((nuxtApp) => {
  // TEMP: disable Sentry to test if it causes the demo freeze
  return {
    provide: {
      sentry: {
        setContext: () => { },
        setUser: () => { },
        setTag: () => { },
        addBreadcrumb: () => { },
        captureException: () => { },
      },
    },
  }

})