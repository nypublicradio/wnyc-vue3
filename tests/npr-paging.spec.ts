import { describe, expect, it } from "vitest"
import { findNprShowId, getNprShowIdFromBlock, nprShowApiPath } from "~/utilities/nprPaging"

const nprEpisode = { type: "npr_episode", id: "a", meta: { nprShowId: "2" } }
const article = { type: "article", id: "x" }
const curatedList = (items) => ({ type: "curated_list", value: { list: { listItems: items } } })

describe("getNprShowIdFromBlock", () => {
  it("reads the show id from the first NPR episode in a curated list", () => {
    expect(getNprShowIdFromBlock(curatedList([article, nprEpisode]))).toBe("2")
  })

  it("returns null for lists without NPR episodes and for other block types", () => {
    expect(getNprShowIdFromBlock(curatedList([article]))).toBeNull()
    expect(getNprShowIdFromBlock({ type: "paragraph", value: "hi" })).toBeNull()
    expect(getNprShowIdFromBlock(undefined)).toBeNull()
  })
})

describe("findNprShowId", () => {
  it("finds the show id in the first block", () => {
    expect(findNprShowId([curatedList([nprEpisode])])).toBe("2")
  })

  it("finds the show id when the NPR list is not the first block", () => {
    expect(findNprShowId([curatedList([article]), { type: "paragraph" }, curatedList([nprEpisode])])).toBe("2")
  })

  it("returns null when no block holds NPR episodes", () => {
    expect(findNprShowId([curatedList([article])])).toBeNull()
    expect(findNprShowId([])).toBeNull()
    expect(findNprShowId(null)).toBeNull()
  })
})

describe("nprShowApiPath", () => {
  it("builds the BFF episodes path for a show", () => {
    expect(nprShowApiPath("2")).toBe("/api/v3/show/npr/2/episodes")
  })
})
