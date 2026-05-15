export default function useSeoMetaOverrides (page) {
  if (page.value?.meta?.seoTitle) {
    const seoTitle = `${page.value?.meta?.seoTitle} | WNYC`
    useHead({
      title: seoTitle,
    })
    useSeoMeta({
      ogTitle: seoTitle,
    })
  }

  const searchDescription = page.value?.meta?.searchDescription
  if (searchDescription) {
    useSeoMeta({
      description: searchDescription,
    })
  }
}