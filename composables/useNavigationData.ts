const headerMenuTemplate = [
    {
        label: "Live Radio",
        url: "/live",
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
                    url: "/schedule"
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

export default function useDarkMode() {

    const headerMenuData = useState('headerMenuData', () => headerMenuTemplate)

    const setDarkMode = () => {

    }

    return { setDarkMode, headerMenuData }
}