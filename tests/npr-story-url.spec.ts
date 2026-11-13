import { describe, expect, it } from "vitest"
import { getNprTitleSlug } from "~/utilities/nprStoryUrl"

const id = "nx-s1-6029331"
const title = "democrats-have-a-long-to-do-list-when-they-take-over-congress-next-year"

describe("getNprTitleSlug", () => {
  it("returns the segment after the id in a dated npr.org link", () => {
    expect(getNprTitleSlug(`https://www.npr.org/2026/11/05/${id}/${title}`, id)).toBe(title)
  })

  it("handles section-prefixed links", () => {
    expect(
      getNprTitleSlug(`https://www.npr.org/sections/shots-health-news/2026/11/05/${id}/${title}`, id)
    ).toBe(title)
  })

  it("ignores query strings and trailing slashes", () => {
    expect(getNprTitleSlug(`https://www.npr.org/2026/11/05/${id}/${title}/?utm=x`, id)).toBe(title)
  })

  it("returns null when the link ends at the id", () => {
    expect(getNprTitleSlug(`https://www.npr.org/2026/11/05/${id}`, id)).toBeNull()
  })

  it("returns null when the id is not in the link", () => {
    expect(getNprTitleSlug(`https://www.npr.org/2026/11/05/other-id/${title}`, id)).toBeNull()
  })

  it("returns null for the normalizer's '/' fallback and missing input", () => {
    expect(getNprTitleSlug("/", id)).toBeNull()
    expect(getNprTitleSlug(undefined, id)).toBeNull()
    expect(getNprTitleSlug(`https://www.npr.org/2026/11/05/${id}/${title}`)).toBeNull()
  })
})
