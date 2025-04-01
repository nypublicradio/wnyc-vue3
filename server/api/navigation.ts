// Import the base menu structure directly
import { allMenuData } from './menuData';
import axios from 'axios'

const config = useRuntimeConfig();

// normalize for menu function for Wagtail menu data
const normalizeWagtailMenuData = (menuData = []) => { // Add default value
    return menuData.map((item) => ({
        'label': item.value.title,
        'url': item.value.url,
        'icon': '',
        'id': String(item.id),
        'type': item.type,
        'hasSubmenu': false,
        'inHeaderMenu': true,
    }));
};
// normalize for menu function for station data
const normalizeStationsMenuData = (menuData = []) => { // Add default value
    return menuData.map((item) => ({
        'label': item.station,
        'url': `/live?slug=${item.slug}`,
        'icon': '',
        'image': item.image,
        'id': String(item.id),
        'type': item.cmsSource,
        'hasSubmenu': false,
    }));
};
// normalize for menu function for shows data
const normalizeShowsMenuData = (menuData, limit) => {
    if (!menuData?.featuredShows) return []; // Safety check
    return menuData.featuredShows.slice(0, limit).map((item) => ({
        'label': item.title,
        'url': `/browse/shows/${item.slug}`,
        'icon': '',
        'image': item.image,
        'id': String(item.id),
        'type': item.cmsSource,
        'hasSubmenu': false,
    }));
};

async function useNavigationData() {
    let headerNavigationData = [];
    let allNavigationData = [];
    let footerNavigationData = [];
    let footerLegalLinksData = [];
    let donateButtonData = ({
        buttonText: '',
        buttonLink: ''
    });


    try {
        // Fetch all data concurrently
        console.log('Fetching and processing navigation data...');
        const [wagtailResponse, donateResponse, stationsResponse, showsResponse] = await Promise.all([
            axios.get(config.public.HEADER_NAVIGATION_API),
            axios.get(config.public.SYSTEM_MESSAGES_API),
            axios.get(`${config.public.BFF_URL}/api/streams`),
            axios.get(`${config.public.BFF_URL}/api/v2/shows`),
        ]);

        console.log('how many times?')

        // IMPORTANT: Create a deep clone to avoid modifying the imported `allMenuData` object directly.
        let workingHeaderNav = allMenuData.map(item => ({ ...item }));

        // Normalize and merge Stations
        const stationsItems = normalizeStationsMenuData(stationsResponse.data);
        if (workingHeaderNav[0]?.items?.[0]) {
            workingHeaderNav[0].items[0].splice(0, 0, ...stationsItems);
        }

        // Normalize and merge Shows
        const showsItems = normalizeShowsMenuData(showsResponse.data, 5);
        if (workingHeaderNav[1]?.items?.[0]) {
            workingHeaderNav[1].items[0].splice(0, 0, ...showsItems);
        }

        // Create the 'allNavigationData' state *before* header-specific modifications
        // Clone again to ensure 'allNav' is independent from further 'workingHeaderNav' changes
        const workingAllNav = workingHeaderNav.map(item => ({ ...item }));

        // Normalize and merge Wagtail Primary Navigation
        const primaryNavItems = normalizeWagtailMenuData(wagtailResponse.data?.primary_navigation);
        workingHeaderNav.splice(2, 0, ...primaryNavItems);

        // Inject primary nav into the 'Collections' section of 'allNav'
        const collectionsMenuItem = workingAllNav.find((item) => item.label === "Collections");
        if (collectionsMenuItem?.items) {
            // Assuming replacement of the first item list
            collectionsMenuItem.items[0] = primaryNavItems;
        }

        // Wagtail Secondary Navigation
        const legalLinkItems = normalizeWagtailMenuData(wagtailResponse.data?.legal_links);

        // Filter header navigation based on 'inHeaderMenu' flag
        workingHeaderNav = workingHeaderNav.filter((item) => item.inHeaderMenu !== false);

        // Process Donate Button data
        const donateBanner = donateResponse.data?.product_banners?.find(
            (banner) => banner.value.title === "WNYC App Donate Button"
        );
        const finalDonateData = { buttonText: '', buttonLink: '' };
        if (donateBanner) {
            finalDonateData.buttonText = donateBanner.value.button_text;
            finalDonateData.buttonLink = donateBanner.value.button_link;
        }

        // filter for the footerNavigationData
        const footerNavItems = allNavigationData.filter((item) => item.inFooterMenu !== false);

        // --- Update Shared State ---
        headerNavigationData = workingHeaderNav;
        allNavigationData = workingAllNav;
        footerNavigationData = footerNavItems;
        footerLegalLinksData = legalLinkItems;
        donateButtonData = finalDonateData;

    } catch (fetchError) {
        console.error("Failed to fetch or process navigation data:", fetchError);
        // Reset state or set error indicators if needed
        headerNavigationData = [];
        allNavigationData = [];
        footerNavigationData = [];
        footerLegalLinksData = [];
        donateButtonData = { buttonText: '', buttonLink: '' };
    }

    return {
        headerNavigationData,
        allNavigationData,
        footerNavigationData,
        footerLegalLinksData,
        donateButtonData,
    };

}



export default defineEventHandler(async (event) => {
    //console.log('getting home page TOP STORIES data')
    const res = event?.node?.res;
    res.setHeader('Cache-Control', 'maxage=120, stale-while-revalidate');
    const data = await useNavigationData();

    return {
        data,
    }
})
