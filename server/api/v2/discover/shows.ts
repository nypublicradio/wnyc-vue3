import axios from 'axios'
import { shouldBypassServerCache } from '~/server/utils/cacheOptions'

type LegacyDiscoverQuery = Record<string, unknown>

const __getConfig = () => {
  const testCfg = (globalThis as any)?.__testRuntimeConfig
  return testCfg ?? useRuntimeConfig()
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

export const getLegacyDiscoverShows = async (query: LegacyDiscoverQuery) => {
  const config = __getConfig()
  const publisherBaseApi = config.public.PUBLISHER_BASE_API ?? 'https://api.wnyc.org/api/'

  const res = await axios({
    method: 'GET',
    url: `${trimTrailingSlash(publisherBaseApi)}/v1/discover/shows/`,
    params: query,
    timeout: 10000,
  })

  return res.data
}

export default defineCachedEventHandler(async (event) => {
  return getLegacyDiscoverShows(getQuery(event))
}, {
  maxAge: 3600,
  swr: true,
  shouldBypassCache: shouldBypassServerCache,
  name: 'v2-discover-shows',
  getKey: (event) => JSON.stringify(getQuery(event))
})
