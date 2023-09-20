import humps from 'humps'

// transform response data to camelCase
export function transformResponseData(data: Record<string, any>): Record<string, any> {
    return humps.camelizeKeys(data)
}

// useFetch is a composable function that fetches data from the Publisher API
export default async function usePublisherFetch(path: string, options: Record<string, any> = {}) {
    const config = useRuntimeConfig()
    const { data, error } = await useFetch(path, { baseURL: config.public.PUBLISHER_BASE_API, ...options })
    const transformedData = transformResponseData(data)
    return { data: transformedData, error }
}