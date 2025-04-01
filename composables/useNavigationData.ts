// Import the base menu structure directly
import { allMenuData } from './menuData';

// Shared state variables (singleton pattern)
let isInitialized = false;
let headerNavigationData = null;
let allNavigationData = null;
let footerNavigationData = null;
let footerLegalLinksData = null;
let donateButtonData = null;
let fetchStatus = null;
let fetchError = null;

// normalize for menu function for Wagtail menu data
const normalizeWagtailMenuData = (menuData = []) => {
    return menuData.map((item) => ({
        label: item.value.title,
        url: item.value.url,
        icon: '',
        id: String(item.id),
        type: item.type,
        hasSubmenu: false,
        inHeaderMenu: true,
    }));
};

// normalize for menu function for station data
const normalizeStationsMenuData = (menuData = []) => {
    return menuData.map((item) => ({
        label: item.station,
        url: `/live?slug=${item.slug}`,
        icon: '',
        image: item.image,
        id: String(item.id),
        type: item.cmsSource,
        hasSubmenu: false,
    }));
};

// normalize for menu function for shows data
const normalizeShowsMenuData = (menuData, limit) => {
    if (!menuData?.featuredShows) return [];
    return menuData.featuredShows.slice(0, limit).map((item) => ({
        label: item.title,
        url: `/browse/shows/${item.slug}`,
        icon: '',
        image: item.image,
        id: String(item.id),
        type: item.cmsSource,
        hasSubmenu: false,
    }));
};

export default function useNavigationData() {
    // Initialize shared state only once
    if (!isInitialized) {
        isInitialized = true;

        // Define shared state (singleton)
        headerNavigationData = useState("headerNavigationData", () => []);
        allNavigationData = useState("allNavigationData", () => []);
        footerNavigationData = useState("footerNavigationData", () => []);
        footerLegalLinksData = useState("footerLegalLinksData", () => []);
        donateButtonData = useState<{ buttonText: string, buttonLink: string }>("donateButtonData", () => ({
            buttonText: '',
            buttonLink: ''
        }));

        // Fetch and process data once
        const { status, error } = useAsyncData(
            'navigation-data-fetch',
            async () => {
                const config = useRuntimeConfig();

                try {
                    const [wagtailResponse, donateResponse, stationsResponse, showsResponse] = await Promise.all([
                        $fetch(config.public.HEADER_NAVIGATION_API),
                        $fetch(config.public.SYSTEM_MESSAGES_API),
                        $fetch(`${config.public.BFF_URL}/api/streams`),
                        $fetch(`${config.public.BFF_URL}/api/v2/shows`),
                    ]);

                    // IMPORTANT: Create a deep clone to avoid modifying the imported `allMenuData` object directly.
                    let workingHeaderNav = allMenuData.map(item => ({ ...item }));

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
                    const workingAllNav = workingHeaderNav.map(item => ({ ...item }));

                    // Normalize and merge Wagtail Primary Navigation
                    const primaryNavItems = normalizeWagtailMenuData(wagtailResponse?.primary_navigation);
                    workingHeaderNav.splice(2, 0, ...primaryNavItems);

                    const collectionsMenuItem = workingAllNav.find((item) => item.label === "Collections");
                    if (collectionsMenuItem?.items) {
                        collectionsMenuItem.items[0] = primaryNavItems;
                    }

                    const legalLinkItems = normalizeWagtailMenuData(wagtailResponse?.legal_links);

                    workingHeaderNav = workingHeaderNav.filter((item) => item.inHeaderMenu !== false);

                    const donateBanner = donateResponse?.product_banners?.find(
                        (banner) => banner.value.title === "WNYC App Donate Button"
                    );
                    const finalDonateData = { buttonText: '', buttonLink: '' };
                    if (donateBanner) {
                        finalDonateData.buttonText = donateBanner.value.button_text;
                        finalDonateData.buttonLink = donateBanner.value.button_link;
                    }

                    const footerNavItems = workingAllNav.filter((item) => item.inFooterMenu !== false);

                    // Update shared state
                    headerNavigationData.value = workingHeaderNav;
                    allNavigationData.value = workingAllNav;
                    footerNavigationData.value = footerNavItems;
                    footerLegalLinksData.value = legalLinkItems;
                    donateButtonData.value = finalDonateData;


                    // const config = useRuntimeConfig()
                    // const { data: vData, error } = await useFetch(`${config.public.BFF_URL}/api/navigation`)
                    // const bffData = vData.value.data

                    // console.log('bffData', bffData)

                    // // Update shared state
                    // headerNavigationData.value = bffData.headerNavigationData;
                    // allNavigationData.value = bffData.allNavigationData;
                    // footerNavigationData.value = bffData.footerNavigationData;
                    // footerLegalLinksData.value = bffData.footerLegalLinksData;
                    // donateButtonData.value = bffData.donateButtonData;

                } catch (fetchError) {
                    console.error("Failed to fetch or process navigation data:", fetchError);
                    headerNavigationData.value = [];
                    allNavigationData.value = [];
                    footerNavigationData.value = [];
                    footerLegalLinksData.value = [];
                    donateButtonData.value = { buttonText: '', buttonLink: '' };
                }
            },
            { server: true }
        );

        fetchStatus = status;
        fetchError = error;
    }

    // Return the shared state and status
    return {
        headerNavigationData,
        allNavigationData,
        footerNavigationData,
        footerLegalLinksData,
        donateButtonData,
        status: fetchStatus,
        error: fetchError
    };
}
