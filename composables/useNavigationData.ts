const config = useRuntimeConfig()

const headerMenuTemplate = [
    {
        label: "Live Radio",
        //url: "/live",
        id: "0",
        icon: "",
        hasSubmenu: true,
        items: [
            [
                {
                    label: "All Streams",
                    url: "/live"
                },
                {
                    label: "Daily Schedule",
                    url: "/live"
                },
            ],
        ],
    },
    {
        label: "Browse All Shows",
        id: "1",
        icon: "",
        hasSubmenu: true,
        items: [
            [
                {
                    label: "All Shows",
                    url: "/browse"
                },
            ],
        ],
    },
    {
        label: "Saved",
        id: "2",
        icon: "",
        hasSubmenu: true,
        items: [
            [
                {
                    label: "Favorites",
                    url: "/browse"
                },
                {
                    label: "Followed Shows",
                    url: "/browse"
                },
                {
                    label: "Listening History",
                    url: "/browse"
                },
            ],
        ],
    },

]

const normalizeWagtailMenuData = (menuData) => {
    return menuData.map((item) => ({
        'label': item.value.title,
        'url': item.value.url,
        'icon': '',
        'id': String(item.id),
        'type': item.type,
        'hasSubmenu': false,
    }))
}
const normalizeStationsMenuData = (menuData) => {
    return menuData.map((item) => ({
        'label': item.station,
        'url': `/live?slug=${item.slug}`,
        'icon': '',
        'image': item.image,
        'id': String(item.id),
        'type': item.cmsSource,
        'hasSubmenu': false,
    }))
}
const normalizeShowsMenuData = (menuData, limit) => {
    return menuData.featuredShows.slice(0, limit).map((item) => ({
        'label': item.station,
        'url': `/live?slug=${item.slug}`,
        'icon': '',
        'image': item.image,
        'id': String(item.id),
        'type': item.cmsSource,
        'hasSubmenu': false,
    }));
}

export default async function useNavigationData() {
    // Fetch data concurrently using Promise.all
    const [wagtailNavigationResponse, donateResponse, stationsResponse, showsResponse] = await Promise.all([
        useFetch(config.public.HEADER_NAVIGATION_API),
        useFetch(config.public.SYSTEM_MESSAGES_API),
        useFetch(`${config.public.BFF_URL}/api/streams`),
        useFetch(`${config.public.BFF_URL}/api/v2/shows`),

    ]);

    const wagtailNavigationData = ref(wagtailNavigationResponse.data.value);
    const allCurrentStations = ref(stationsResponse.data.value);
    const showsData = ref(showsResponse.data.value);
    const headerNavigationData = useState('headerNavigationDataM', () => null);
    const donateButtonData = useState('donateButtonData', () => ({
        buttonText: '',
        buttonLink: ''
    }));

    // Process radio stations data and normalize it
    const stationsData = normalizeStationsMenuData(allCurrentStations.value);

    // merge radio stations data into the Live Radio menu items
    headerMenuTemplate[0].items[0].splice(0, 0, ...stationsData);

    // Process navigation data and normalize it
    const primaryNavigation = normalizeWagtailMenuData(wagtailNavigationData.value.primary_navigation);

    // merge wagtailNavigationData with headerMenuTemplate at the 2 index
    headerNavigationData.value = headerMenuTemplate;
    headerNavigationData.value.splice(2, 0, ...primaryNavigation);

    // process shows data and normalize it
    const shows = normalizeShowsMenuData(showsData.value, 5);
    console.log('shows', shows);

    // Process donate data
    if (donateResponse.data.value?.product_banners?.length > 0) {
        donateResponse.data.value.product_banners.forEach((banner) => {
            if (banner.value.title === "WNYC App Donate Button") {
                donateButtonData.value.buttonText = banner.value.button_text;
                donateButtonData.value.buttonLink = banner.value.button_link;
            }
        });
    }

    return { headerNavigationData, donateButtonData };
}

