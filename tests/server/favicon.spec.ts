import { beforeEach, describe, expect, it, vi } from "vitest"

const fetchMock = vi.fn()
const setResponseHeadersMock = vi.fn()
const setResponseHeaderMock = vi.fn()
const sendRedirectMock = vi.fn((_event: unknown, location: string, code: number) => ({
  location,
  code,
}))

// @ts-expect-error test-only global
globalThis.defineEventHandler = (handler: unknown) => handler
// @ts-expect-error test-only global
globalThis.$fetch = fetchMock
// @ts-expect-error test-only global
globalThis.setResponseHeaders = setResponseHeadersMock
// @ts-expect-error test-only global
globalThis.setResponseHeader = setResponseHeaderMock
// @ts-expect-error test-only global
globalThis.sendRedirect = sendRedirectMock

describe("GET /favicon.png", () => {
  beforeEach(() => {
    vi.resetModules()
    fetchMock.mockReset()
    setResponseHeadersMock.mockReset()
    setResponseHeaderMock.mockReset()
    sendRedirectMock.mockClear()
  })

  it("serves the Wagtail favicon with a 1 hour cache", async () => {
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47]).buffer
    fetchMock.mockResolvedValue(png)
    const { default: handler } = await import("~/server/routes/favicon.png.get")

    const result = await handler({} as any)

    expect(fetchMock).toHaveBeenCalledWith(
      "https://cms.prod.nypr.digital/images/362345/fill-32x32|format-png/",
      expect.objectContaining({ responseType: "arrayBuffer" })
    )
    expect(setResponseHeadersMock).toHaveBeenCalledWith(expect.anything(), {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=3600",
    })
    expect(Buffer.isBuffer(result)).toBe(true)
    expect([...(result as Buffer)]).toEqual([0x89, 0x50, 0x4e, 0x47])
    expect(sendRedirectMock).not.toHaveBeenCalled()
  })

  it("redirects to the local favicon, uncached, when Wagtail fails", async () => {
    fetchMock.mockRejectedValue(new Error("fetch failed"))
    const { default: handler } = await import("~/server/routes/favicon.png.get")

    const result = await handler({} as any)

    expect(setResponseHeaderMock).toHaveBeenCalledWith(
      expect.anything(),
      "Cache-Control",
      "no-store"
    )
    expect(sendRedirectMock).toHaveBeenCalledWith(
      expect.anything(),
      "/favicon-32x32.png",
      302
    )
    expect(result).toEqual({ location: "/favicon-32x32.png", code: 302 })
    expect(setResponseHeadersMock).not.toHaveBeenCalled()
  })
})
