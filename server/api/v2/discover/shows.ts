import axios from 'axios'

type LegacyDiscoverQuery = Record<string, unknown>

type JsonApiRelationship = {
  data?: { type: string, id: string } | Array<{ type: string, id: string }> | null
}

type JsonApiResource = {
  id: string
  type: string
  attributes?: Record<string, any>
  relationships?: Record<string, JsonApiRelationship>
}

type PublisherShowsResponse = {
  data?: JsonApiResource[]
  included?: JsonApiResource[]
}

const __getConfig = () => {
  const testCfg = (globalThis as any)?.__testRuntimeConfig
  return testCfg ?? useRuntimeConfig()
}

const getQueryValue = (query: LegacyDiscoverQuery, key: string) => {
  const value = query[key]
  if (Array.isArray(value)) return String(value[0] ?? '')
  return String(value ?? '')
}

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '')

const includedResourceMap = (resources: JsonApiResource[] = []) => {
  return new Map(resources.map((resource) => [`${resource.type}:${resource.id}`, resource]))
}

const getRelationshipResources = (
  show: JsonApiResource,
  relationshipName: string,
  included: Map<string, JsonApiResource>
) => {
  const relationshipData = show.relationships?.[relationshipName]?.data
  const items = Array.isArray(relationshipData)
    ? relationshipData
    : relationshipData
      ? [relationshipData]
      : []

  return items
    .map((item) => included.get(`${item.type}:${item.id}`))
    .filter(Boolean) as JsonApiResource[]
}

const getRelationshipResource = (
  show: JsonApiResource,
  relationshipName: string,
  included: Map<string, JsonApiResource>
) => getRelationshipResources(show, relationshipName, included)[0]

const organizationData = (organizations: JsonApiResource[]) => {
  return organizations.map((organization) => ({
    name: organization.attributes?.name,
    url: organization.attributes?.url,
  })).filter((organization) => organization.name)
}

const toNumber = (value: string) => {
  const parsed = Number(value)
  return Number.isNaN(parsed) ? value : parsed
}

const toLegacyDiscoverShow = (
  show: JsonApiResource,
  included: Map<string, JsonApiResource>,
  publisherBaseApi: string
) => {
  const attrs = show.attributes ?? {}
  const id = toNumber(show.id)
  const image = getRelationshipResource(show, 'image', included)?.attributes ?? null
  const producingOrganizations = organizationData(
    getRelationshipResources(show, 'producing-organizations', included)
  )

  return {
    id,
    pk: id,
    title: attrs.title,
    description: attrs.description,
    slug: attrs.slug,
    type: show.type,
    image,
    list_api_url: `${trimTrailingSlash(publisherBaseApi)}/v3/story/?show=${attrs.slug}`,
    producingOrganizations,
    producing_organizations: producingOrganizations,
    url: attrs.url ?? null,
  }
}

export const getLegacyDiscoverShows = async (query: LegacyDiscoverQuery) => {
  const config = __getConfig()
  const publisherBaseApi = config.public.PUBLISHER_BASE_API ?? 'https://api.wnyc.org/api/'
  const params: Record<string, string> = {}
  const discoverStation = getQueryValue(query, 'discover_station')
  const apiKey = getQueryValue(query, 'api_key')

  if (discoverStation) params.discover_station = discoverStation
  if (apiKey) params.api_key = apiKey

  const res = await axios({
    method: 'GET',
    url: `${trimTrailingSlash(publisherBaseApi)}/v3/shows/`,
    params,
    timeout: 10000,
  })
  const responseData = res.data as PublisherShowsResponse
  const included = includedResourceMap(responseData.included)

  return (responseData.data ?? []).map((show) => toLegacyDiscoverShow(show, included, publisherBaseApi))
}

export default defineEventHandler(async (event) => {
  const res = event?.node?.res
  res?.setHeader('Cache-Control', 'max-age=3600, stale-while-revalidate')

  return getLegacyDiscoverShows(getQuery(event))
})
