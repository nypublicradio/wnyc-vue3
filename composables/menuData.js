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
                        logOutUser()
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

export { allMenuData, allSocialData }