import axios from 'axios'
import humps from 'humps'
import { normalizePublisherPage } from '~/composables/data/articlePages'

const config = useRuntimeConfig();

const getSectionData = async (slug: string) => {
    try {
        const option = {
            method: 'GET',
            url: `${config.public.PUBLISHER_BASE_API}v3/channel/shows/wnyc-app/${slug}`,
        };
        const res = await axios(option);
        const resData = res.data.included.map((item: any) => {
            return normalizePublisherPage(humps.camelizeKeys(item));
        });
        return resData;
    } catch (e) {
        //console.log(e);
    }
};

export default defineEventHandler(async (event) => {
    const templateSlug: string | undefined = event?.context?.params?.templateSlug;
    if (templateSlug) {
        const sectionData = await getSectionData(templateSlug);
        return sectionData;
    }
});