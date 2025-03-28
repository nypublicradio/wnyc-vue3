// Import the base menu structure directly
import { allMenuData } from './menuData';

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

export default function useNavigationData() {
    // 1. Define shared state (initialize appropriately)
    const headerNavigationData = useState("headerNavigationData", () => []);
    const allNavigationData = useState("allNavigationData", () => []);
    const footerNavigationData = useState("footerNavigationData", () => []);
    const footerLegalLinksData = useState("footerLegalLinksData", () => []);
    const donateButtonData = useState<{ buttonText: string, buttonLink: string }>("donateButtonData", () => ({
        buttonText: '',
        buttonLink: ''
    }));

    // 2. Fetch and process data once using useAsyncData
    const { status, error } = useAsyncData(
        'navigation-data-fetch', // Unique key for deduplication
        async () => {
            //console.log('Fetching and processing navigation data...');
            const config = useRuntimeConfig();

            try {
                // Fetch all data concurrently
                const [wagtailResponse, donateResponse, stationsResponse, showsResponse] = await Promise.all([
                    $fetch(config.public.HEADER_NAVIGATION_API),
                    $fetch(config.public.SYSTEM_MESSAGES_API),
                    $fetch(`${config.public.BFF_URL}/api/streams`),
                    $fetch(`${config.public.BFF_URL}/api/v2/shows`),
                ]);

                // --- Data Processing ---

                // IMPORTANT: Create a deep clone to avoid modifying the imported `allMenuData` object directly.
                let workingHeaderNav = JSON.parse(JSON.stringify(allMenuData));

                // Normalize and merge Stations
                const stationsItems = normalizeStationsMenuData(stationsResponse);
                if (workingHeaderNav[0]?.items?.[0]) {
                    workingHeaderNav[0].items[0].splice(0, 0, ...stationsItems);
                }

                // Normalize and merge Shows
                const showsItems = normalizeShowsMenuData(showsResponse, 5);
                if (workingHeaderNav[1]?.items?.[0]) {
                    workingHeaderNav[1].items[0].splice(0, 0, ...showsItems);
                }

                // Create the 'allNavigationData' state *before* header-specific modifications
                // Clone again to ensure 'allNav' is independent from further 'workingHeaderNav' changes
                const workingAllNav = JSON.parse(JSON.stringify(workingHeaderNav));

                // Normalize and merge Wagtail Primary Navigation
                const primaryNavItems = normalizeWagtailMenuData(wagtailResponse?.primary_navigation);
                workingHeaderNav.splice(2, 0, ...primaryNavItems);

                // Inject primary nav into the 'Collections' section of 'allNav'
                const collectionsMenuItem = workingAllNav.find((item) => item.label === "Collections");
                if (collectionsMenuItem?.items) {
                    // Assuming replacement of the first item list
                    collectionsMenuItem.items[0] = primaryNavItems;
                }

                // Wagtail Secondary Navigation
                const legalLinkItems = normalizeWagtailMenuData(wagtailResponse?.legal_links);

                // Filter header navigation based on 'inHeaderMenu' flag
                workingHeaderNav = workingHeaderNav.filter((item) => item.inHeaderMenu !== false);

                // Process Donate Button data
                const donateBanner = donateResponse?.product_banners?.find(
                    (banner) => banner.value.title === "WNYC App Donate Button"
                );
                const finalDonateData = { buttonText: '', buttonLink: '' };
                if (donateBanner) {
                    finalDonateData.buttonText = donateBanner.value.button_text;
                    finalDonateData.buttonLink = donateBanner.value.button_link;
                }

                // filter for the footerNavigationData
                const footerNavItems = allNavigationData.value.filter((item) => item.inFooterMenu !== false);

                // --- Update Shared State ---
                headerNavigationData.value = workingHeaderNav;
                allNavigationData.value = workingAllNav;
                footerNavigationData.value = footerNavItems;
                footerLegalLinksData.value = legalLinkItems;
                donateButtonData.value = finalDonateData;

                //console.log('Navigation state updated.');

            } catch (fetchError) {
                console.error("Failed to fetch or process navigation data:", fetchError);
                // Reset state or set error indicators if needed
                headerNavigationData.value = [];
                allNavigationData.value = [];
                footerNavigationData.value = [];
                footerLegalLinksData.value = [];
                donateButtonData.value = { buttonText: '', buttonLink: '' };
            }
        },
        { server: true } // Fetch on server-side (default, but good to be explicit)
    );

    // 3. Return the reactive state refs and status
    return {
        headerNavigationData,
        allNavigationData,
        footerNavigationData,
        footerLegalLinksData,
        donateButtonData,
        status,
        error
    };
}