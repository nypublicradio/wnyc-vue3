import humps from 'humps'

function transformResponseData(data: Record<string, any>): Record<string, any> {
  return humps.camelizeKeys(data)
}
//  useFetch is a composable function that fetches data from the wagtail API
// should be $fetch and not useFetch
// I dont think we are using this function in this app, so I will leave it for now.
export default async function useAviary(path: string, options: Record<string, any> = {}) {
  const config = useRuntimeConfig()
  const { data, error } = await useFetch(path, { baseURL: config.public.AVIARY_BASE_API, ...options })
  const transformedData = transformResponseData(data)
  return { data: transformedData, error }
}
