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
                    url: "/live?schedule=true",
                },
            ],
        ],
    },
    {
        label: "Daily Schedule",
        url: "/live?schedule=true",
        id: "8",
        icon: "",
        hasSubmenu: false,
        inHeaderMenu: true,
        inFooterMenu: false,
        items: [
            [
                {
                    label: "Schedule",
                    url: "/live?schedule=true",
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
            // populated from Wagtail primary navigation
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
            // populated from Wagtail secondary navigation
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
            // populated from Wagtail tertiary navigation
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

export { allMenuData }