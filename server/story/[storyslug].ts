import axios from 'axios'
import humps from 'humps'

const config = useRuntimeConfig();

// Get story data from CMS

export default defineEventHandler(async (event) => {
    const slug: string | undefined = event?.context?.params?.storyslug;
    if (slug) {
        //TODO: Call function to get story data
    }
});