const allMenuData = [
    {
        label: "Live Radio",
        //url: "/live",
        id: "0",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: true,
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
        label: "Inside WNYC",
        id: "3",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
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
        label: "Account",
        id: "6",
        icon: "",
        hasSubmenu: true,
        inHeaderMenu: false,
        items: [
            [
                {
                    label: "Create Free Account",
                    url: "/signup"
                },
                {
                    label: "Log in",
                    url: "/login"
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

export default allMenuData