import { appendNprPage } from "~/utilities/nprPaging"
import { trackClickEvent } from "~/utilities/helpers"
import { useGlobalToast } from "~/composables/states"

/**
 * Lets a list layout fetch more items when the list carries `nextPage: { path, offset }`.
 * Fetched items live here, not in `list.listItems`, so layouts watching that array don't reset.
 */
export const usePagedList = (list: Ref<any>) => {
  const config = useRuntimeConfig()
  const extra = ref<any[]>([])
  const next = ref(list.value?.nextPage ?? null)
  const pending = ref(false)

  watch(
    () => list.value?.listItems,
    () => {
      extra.value = []
      next.value = list.value?.nextPage ?? null
    }
  )

  const items = computed(() => [...(list.value?.listItems ?? []), ...extra.value])
  const canLoadMore = computed(() => Boolean(next.value))

  const loadMore = async () => {
    if (pending.value || !next.value) return
    pending.value = true
    const { path, offset } = next.value
    try {
      const res = await $fetch(`${config.public.BFF_URL}${path}`, { query: { offset } })
      const page = appendNprPage(
        { items: extra.value, nextOffset: offset, hasMore: true },
        res,
        (list.value.listItems ?? []).map((item) => item.id)
      )
      extra.value = page.items
      next.value = page.hasMore ? { path, offset: page.nextOffset } : null
      trackClickEvent("Event Tracking - load more episodes", "Shows Page", list.value?.title)
    } catch (err) {
      useGlobalToast().value = {
        severity: "error",
        summary: "Sorry. We are having trouble loading more episodes. Please try again later.",
        life: null,
        closable: true,
      }
      console.error("List pagination error:", err)
    } finally {
      pending.value = false
    }
  }

  return { items, canLoadMore, pending, loadMore }
}
