import axios from 'axios'

import { logOutUser } from "~/utilities/helpers"

const allMenuData = [
    {
        label: "Live Radio",
        //url: "/live",
        id: "0",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: true,
        inFooterMenu: false,
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
        inHeaderMenu: true,
        inFooterMenu: false,
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
        label: "Collections",
        id: "7",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
        inFooterMenu: false,
        items: [
            [

            ],
        ],
    },
    {
        label: "Inside WNYC",
        id: "3",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
        inFooterMenu: true,
        items: [
            [
                {
                    label: "About Us",
                    url: "/about"
                },
                {
                    label: "Archives",
                    url: "/archives/collections"
                },
                {
                    label: "100 Years",
                    url: "/100"
                },
                {
                    label: "Diversity (DEI)",
                    url: "/diversity-dei-overview"
                },
            ],
        ],
    },
    {
        label: "Get Involved",
        id: "4",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
        inFooterMenu: true,
        items: [
            [
                {
                    label: "Support Us",
                    url: "/support"
                },
                {
                    label: "Become a Sponsor",
                    url: "https://sponsorship.wnyc.org/"
                },
                {
                    label: "Events",
                    url: "/events"
                },
                {
                    label: "Community",
                    url: "/community"
                },
            ],
        ],
    },
    {
        label: "Get in Touch",
        id: "5",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
        inFooterMenu: true,
        items: [
            [
                {
                    label: "Contact Us",
                    url: "/contact"
                },
                {
                    label: "Get the App",
                    url: "/mobile"
                },
                {
                    label: "Careers",
                    url: "/careers"
                },
                {
                    label: "Press",
                    url: "/press"
                },
            ],
        ],
    },
    {
        label: "Saved",
        id: "2",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: true,
        inFooterMenu: false,
        class: "saved",
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
    {
        label: "Account",
        id: "6",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
        inFooterMenu: false,
        class: "account",
        items: [
            [
                {
                    label: "Create Free Account",
                    url: "/signup",
                    class: "signup",
                },
                {
                    label: "Saved",
                    url: "/saved",
                    class: "saved",
                },
                {
                    label: "Manage Account",
                    url: "/dashboard",
                    class: "manage",
                },
                {
                    label: "Log in",
                    class: "login",
                    url: "/login"
                },
                {
                    label: "Log out",
                    class: "logout",
                    command: () => {
                        console.log("trying to Logging out...");
                        if (import.meta.client) {
                            logOutUser();
                        }
                    },
                },
            ],
        ],
    },

]

const allSocialData = [
    {
        label: "Instagram",
        url: "https://www.instagram.com/wnyc",
        id: "3",
        icon: "pi pi-instagram",
    },
    {
        label: "X",
        url: "https://x.com/wnyc",
        id: "1",
        icon: "pi pi-twitter",
    },
    {
        label: "YouTube",
        url: "https://www.youtube.com/@WnycOrg",
        id: "2",
        icon: "pi pi-youtube",
    },
    {
        label: "Facebook",
        url: "http://www.facebook.com/wnyc",
        id: "0",
        icon: "pi pi-facebook",
    },
]

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


        // IMPORTANT: Create a deep clone to avoid modifying the imported `allMenuData` object directly.
        let workingHeaderNav = allMenuData.map(item => ({ ...item }));
        //console.log('allMenuData', allMenuData[7].items)

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

        console.log('workingAllNav', workingAllNav[7].items[0][4])
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
        allSocialData,
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
