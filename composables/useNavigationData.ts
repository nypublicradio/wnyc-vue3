import allMenuData from './menuData'

// let headerNavigationData = null;
// let allNavigationData = null;
// let donateButtonData = {
//     buttonText: '',
//     buttonLink: ''
// };

const normalizeWagtailMenuData = (menuData) => {
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

const normalizeStationsMenuData = (menuData) => {
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

const normalizeShowsMenuData = (menuData, limit) => {
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

export default async function useNavigationData() {
    const headerNavigationData = useState("headerNavigationData", () => null);
    const allNavigationData = useState("allNavigationData", () => null);
    const donateButtonData = useState("donateButtonData", () => ({
        buttonText: '',
        buttonLink: ''
    }));

    // prevent multiple fetches
    if (allNavigationData.value) {
        // Return cached data if it has already been fetched
        return { headerNavigationData, allNavigationData, donateButtonData };
    }

    const config = useRuntimeConfig();

    // Fetch data concurrently using Promise.all
    const [wagtailNavigationResponse, donateResponse, stationsResponse, showsResponse] = await Promise.all([
        useFetch(config.public.HEADER_NAVIGATION_API),
        useFetch(config.public.SYSTEM_MESSAGES_API),
        useFetch(`${config.public.BFF_URL}/api/streams`),
        useFetch(`${config.public.BFF_URL}/api/v2/shows`),
    ]);

    console.log('fetched')

    const wagtailNavigationData = wagtailNavigationResponse.data.value;
    const allCurrentStations = stationsResponse.data.value;
    const showsData = showsResponse.data.value;

    // Process radio stations data and normalize it
    const stationsData = normalizeStationsMenuData(allCurrentStations);

    // Merge radio stations data into the Live Radio menu items
    allMenuData[0].items[0].splice(0, 0, ...stationsData);

    // Process navigation data and normalize it
    const primaryNavigation = normalizeWagtailMenuData(wagtailNavigationData.primary_navigation);

    // Merge wagtailNavigationData with allMenuData at the 2 index
    headerNavigationData.value = allMenuData;
    headerNavigationData.value.splice(2, 0, ...primaryNavigation);

    // Process shows data and normalize it
    const shows = normalizeShowsMenuData(showsData, 5);

    // Merge shows data into the Browse All Shows menu items
    headerNavigationData.value[1].items[0].splice(0, 0, ...shows);

    allNavigationData.value = headerNavigationData.value;

    // Remove items not to display in the header menu by the inHeaderMenu key
    headerNavigationData.value = headerNavigationData.value.filter((item) => item.inHeaderMenu);

    // Process donate data
    if (donateResponse.data.value?.product_banners?.length > 0) {
        donateResponse.data.value.product_banners.forEach((banner) => {
            if (banner.value.title === "WNYC App Donate Button") {
                donateButtonData.value.buttonText = banner.value.button_text;
                donateButtonData.value.buttonLink = banner.value.button_link;
            }
        });
    }

    return { headerNavigationData, allNavigationData, donateButtonData };
}
