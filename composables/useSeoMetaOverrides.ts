export default function useSeoMetaOverrides (page) {
  // apply SEO overrides from the CMS "Promote" tab
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