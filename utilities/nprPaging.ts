/** NPR collection id of the show, taken from the first NPR episode in a curated list block. */
export const getNprShowIdFromBlock = (block: any): string | null => {
  const items = block?.type === "curated_list" ? block.value?.list?.listItems : null
  return items?.find((item) => item.type === "npr_episode" && item.meta?.nprShowId)?.meta.nprShowId ?? null
}

/** NPR collection id of the show from the first curated list in the body that holds NPR episodes. */
export const findNprShowId = (body: any[] | null): string | null => {
  for (const block of body ?? []) {
    const showId = getNprShowIdFromBlock(block)
    if (showId) return showId
  }
  return null
}

/** BFF path for paging through an NPR show's episodes (`?offset=&limit=`). */
export const nprShowApiPath = (showId: string) => `/api/v3/show/npr/${showId}/episodes`
