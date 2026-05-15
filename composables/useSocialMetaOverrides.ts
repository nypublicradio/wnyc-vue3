export default function useSocialMetaOverrides (page) {
  const socialTitle = page.value?.socialTitle
  if (socialTitle) {
    useSeoMeta({
      ogTitle: socialTitle,
    })
  }

  const socialDescription = page.value?.socialText
  if (socialDescription) {
    useSeoMeta({
      ogDescription: socialDescription,
    })
  }

  const socialImage = page.value?.socialImage
  if (socialImage) {
    useSeoMeta({
      ogImage: socialImage,
    })
  }
}