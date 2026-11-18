import { describe, expect, it, vi } from 'vitest'

vi.mock('@sentry/vue', async (importOriginal) => {
  const original = await importOriginal<typeof import('@sentry/vue')>()
  return {
    ...original,
    init: vi.fn(),
    browserTracingIntegration: vi.fn(),
    attachErrorHandler: vi.fn(original.attachErrorHandler),
  }
})

// Nuxt auto-imports
vi.stubGlobal('defineNuxtPlugin', (plugin: unknown) => plugin)
vi.stubGlobal('useRuntimeConfig', () => ({ public: { SENTRY_DSN: '', SENTRY_ENV: 'test' } }))

const Sentry = await import('@sentry/vue')
const { default: sentryPlugin } = await import('~/plugins/sentry.client.js')

describe('sentry plugin', () => {
  it('only reports Vue errors once the app has loaded, instead of showing the error page', () => {
    const hooks: Record<string, () => void> = {}
    // Nuxt's startup handler, which shows the error page
    const showErrorPage = vi.fn()
    const vueApp = { config: { errorHandler: showErrorPage as any } }
    const nuxtApp = {
      vueApp,
      $router: {},
      hooks: { hookOnce: (name: string, hook: () => void) => { hooks[name] = hook } },
    }

    ;(sentryPlugin as any)(nuxtApp)
    // errors while the app starts still show the error page
    expect(vueApp.config.errorHandler).toBe(showErrorPage)

    // the app has loaded
    hooks['app:suspense:resolve']()
    expect(Sentry.attachErrorHandler).toHaveBeenCalledWith(vueApp, expect.objectContaining({ attachProps: true }))

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => vueApp.config.errorHandler(new Error('boom'), null, 'mounted hook')).not.toThrow()
    expect(showErrorPage).not.toHaveBeenCalled()
    expect(consoleError).toHaveBeenCalledWith('[Vue error in mounted hook]', expect.any(Error))
    consoleError.mockRestore()
  })
})
