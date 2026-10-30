import { describe, expect, it } from "vitest"
import { appendNprPage, attachNprNextPage } from "~/utilities/nprPaging"

const initialNprPaging = () => ({ items: [], nextOffset: null, hasMore: true })

const page = (ids: string[], nextOffset: number | null, hasMore = nextOffset !== null) => ({
  data: ids.map((id) => ({ id })),
  meta: { hasMore, pagination: { nextOffset } },
})

describe("appendNprPage", () => {
  it("appends new items and takes the next offset from the BFF", () => {
    const state = appendNprPage(initialNprPaging(), page(["a", "b"], 20), [])

    expect(state.items.map((i) => i.id)).toEqual(["a", "b"])
    expect(state.nextOffset).toBe(20)
    expect(state.hasMore).toBe(true)
  })

  it("still advances the offset when a whole page is already on the page", () => {
    const state = appendNprPage(initialNprPaging(), page(["a", "b"], 20), ["a", "b"])

    expect(state.items).toEqual([])
    expect(state.nextOffset).toBe(20)
  })

  it("still advances the offset when the BFF filtered a page down to nothing", () => {
    const state = appendNprPage(initialNprPaging(), page([], 30), [])

    expect(state.items).toEqual([])
    expect(state.nextOffset).toBe(30)
    expect(state.hasMore).toBe(true)
  })

  it("drops items seen in an earlier page", () => {
    const first = appendNprPage(initialNprPaging(), page(["a"], 10), [])
    const second = appendNprPage(first, page(["a", "b"], 20), [])

    expect(second.items.map((i) => i.id)).toEqual(["a", "b"])
  })

  it("stops when the BFF says there is no more", () => {
    const state = appendNprPage(initialNprPaging(), page(["a"], null), [])

    expect(state.hasMore).toBe(false)
    expect(state.nextOffset).toBeNull()
  })

  it("treats a missing response as the end", () => {
    expect(appendNprPage(initialNprPaging(), undefined, []).hasMore).toBe(false)
  })
})

describe("attachNprNextPage", () => {
  const npr = { type: "npr_episode", id: "a", meta: { nprShowId: "2" } }
  const body = (items) => [{ type: "curated_list", value: { list: { listItems: items } } }]

  it("tags the list that holds NPR episodes with the next offset", () => {
    expect(attachNprNextPage(body([npr, npr]))[0].value.list.nextPage).toEqual({
      path: "/api/v3/show/npr/2/episodes",
      offset: 2,
    })
  })

  it("leaves non-NPR lists and empty bodies alone", () => {
    expect(attachNprNextPage(body([{ type: "article", id: "x" }]))[0].value.list.nextPage).toBeUndefined()
    expect(attachNprNextPage(null)).toBeNull()
  })
})
