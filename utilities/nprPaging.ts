export interface NprPagingState {
  items: any[]
  nextOffset: number | null
  hasMore: boolean
}

/**
 * Merge one page from /api/v3/show/npr/[slug]/episodes into the paging state.
 * Items already on the page (`knownIds`) are dropped. The next offset comes from
 * the BFF, which knows NPR's position even when it filtered out restricted items.
 */
export const appendNprPage = (
  state: NprPagingState,
  res: any,
  knownIds: string[]
): NprPagingState => {
  const known = new Set([...knownIds, ...state.items.map((item) => item.id)])
  return {
    items: [...state.items, ...(res?.data ?? []).filter((item) => !known.has(item.id))],
    nextOffset: res?.meta?.pagination?.nextOffset ?? null,
    hasMore: res?.meta?.hasMore ?? false,
  }
}

/**
 * Wagtail only sends the latest NPR episodes. Tag the first curated list that holds them
 * with `nextPage` so the list layout knows where to fetch the rest.
 */
export const attachNprNextPage = (body: any[] | null) => {
  for (const block of body ?? []) {
    const items = block?.type === "curated_list" ? block.value?.list?.listItems : null
    const showId = items?.find((item) => item.type === "npr_episode" && item.meta?.nprShowId)?.meta.nprShowId
    if (showId) {
      block.value.list.nextPage = { path: `/api/v3/show/npr/${showId}/episodes`, offset: items.length }
      return body
    }
  }
  return body
}
