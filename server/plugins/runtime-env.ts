export default defineNitroPlugin(() => {
  const aviary = process.env.AVIARY_BASE_API

  if (aviary && !process.env.NUXT_PUBLIC_AVIARY_BASE_API) {
    process.env.NUXT_PUBLIC_AVIARY_BASE_API = aviary
  }
})
