import humps from 'humps'

// transform response data to camelCase
function transformResponseData(data) {
    return humps.camelizeKeys(data)
}

// useFetch is a composable function that fetches data from the Publisher API
export default async function usePublisherFetch(path, options) {
    const config = useRuntimeConfig()
    const { data, error } = await useFetch(path, { baseURL: config.public.PUBLISHER_BASE_API, ...options })
    const transformedData = transformResponseData(data)
    return { data: transformedData, error }
}