// composable to manage scroll position when opening and closing drawers and modals
export default function useManageScrollPosition() {
    const scrollPosition = useState('scrollPosition', () => 0)

    // save the users current scroll position
    const saveScrollPosition = (delay = 600) => {
        if (!import.meta.client) return
        scrollPosition.value = window.scrollY
        // prevent the user from scrolling while the modal is open
        setTimeout(() => {
            document.body.classList.add("p-overflow-hidden")
        }, delay)
    }
    // restore the user to their saved scroll position
    const restoreScrollPosition = () => {
        if (!import.meta.client) return
        document.body.classList.remove("p-overflow-hidden")
        if (scrollPosition.value > 0) {
            window.scrollTo(0, parseInt(scrollPosition.value))
            scrollPosition.value = 0
        }
    }


    return { restoreScrollPosition, scrollPosition, saveScrollPosition }
}