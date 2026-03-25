import { memberCenterLink } from "~/composables/globals"

const allMenuData = [
    {
        label: "Live Radio",
        url: "/live",
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
        url: "/browse?all=false",
        id: "1",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: true,
        inFooterMenu: false,
        items: [
            [
                {
                    label: "All Shows",
                    url: "/browse?all=true"
                },
            ],
        ],
    },
    {
        label: "Events",
        url: "/events",
        id: "events-main",
        icon: "",
        hasSubmenu: false,
        inHeaderMenu: true,
        inFooterMenu: false,
        items: [
            [
                {
                    label: "All Events",
                    url: "/events"
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
                    url: "/browse/shows/wnyc-archives"
                },
                {
                    label: "Giveaways",
                    url: "/giveaways"
                },
                {
                    label: "Diversity (DEI)",
                    url: "https://www.nypublicradio.org/diversity-dei-overview/"
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
                    url: "https://www.nypublicradio.org/support/"
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
                    url: "https://nypublicradio.org/community-advisory-board/ "
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
                    url: "https://newyorkpublicradio.my.site.com/wnyc/s/"
                },
                {
                    label: "Get the App",
                    url: "__USE_APP_DOWNLOAD_LINK__"
                },
                {
                    label: "Careers",
                    url: "https://nypublicradio.org/careers/"
                },
                {
                    label: "Press",
                    url: "https://nypublicradio.org/press-room/"
                },
            ],
        ],
    },
    {
        label: "Saved",
        url: "/saved",
        id: "2",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: true,
        inFooterMenu: false,
        class: "saved",
        items: [
            [
                {
                    label: "Followed Shows",
                    url: "/saved?slug=FollowedShows"
                },
                {
                    label: "Favorites",
                    url: "/saved?slug=Favorites"
                },
                {
                    label: "Listening History",
                    url: "/saved?slug=History"
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
                    label: "Member Center",
                    class: "member-center",
                    url: memberCenterLink
                },
                {
                    label: "Log out",
                    class: "logout",
                    url: "/home",
                    command: "__LOGOUT_COMMAND__",
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
    // {
    //     label: "X",
    //     url: "https://x.com/wnyc",
    //     id: "1",
    //     icon: "pi pi-twitter",
    // },
    // {
    //     label: "Bluesky",
    //     url: "https://bsky.app/profile/wnyc.org",
    //     id: "5",
    //     icon: "pi pi-bluesky",
    // },
    {
        label: "YouTube",
        url: "https://www.youtube.com/@WnycOrg",
        id: "2",
        icon: "pi pi-youtube",
    },
    {
        label: "Facebook",
        url: "https://www.facebook.com/wnyc",
        id: "0",
        icon: "pi pi-facebook",
    },
]

export { allMenuData, allSocialData }