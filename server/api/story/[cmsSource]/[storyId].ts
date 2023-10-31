import axios from 'axios' import humps from 'humps' import {
normalizeArticlePage} from '~/composables/data/articlePages' const config =
useRuntimeConfig(); const getWagtailStoryData = async (id: string) => { try {
const option = { method: 'GET', url:
`${config.public.AVIARY_BASE_API}pages/${id}/`, }; const res = await
axios(option); //return humps.camelizeKeys(res.data); return
normalizeArticlePage(humps.camelizeKeys(res.data)); } catch (e) {
//console.log(e); } }; const getPublisherStoryData = async (id: string) => { try
{ const option = { method: 'GET', url:
`${config.public.PUBLISHER_BASE_API}v3/story-pk/${id}/`, }; const res = await
axios(option); return normalizeArticlePage(humps.camelizeKeys(res.data).data); }
catch (e) { //console.log(e); } }; const getStoryData = async (id: string,
cmsSource: string) => { switch (cmsSource) { case 'wagtail': return await
getWagtailStoryData(id); case 'publisher': return await
getPublisherStoryData(id); default: return null; }; }; // Get story data from
CMS export default defineEventHandler(async (event) => { const id: string |
undefined = event?.context?.params?.storyId; const cmsSource: string | undefined
= event?.context?.params?.cmsSource; if (id && cmsSource) { const storyData =
await getStoryData(id, cmsSource); return storyData; } });
