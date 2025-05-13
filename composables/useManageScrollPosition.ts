export default function useManageScrollPosition() {
    const scrollPosition = useState('scrollPosition', () => 0)

    // save the users current scroll position
    const saveScrollPosition = (delay = 600) => {
        scrollPosition.value = window.scrollY
        // prevent the user from scrolling while the modal is open
        setTimeout(() => {
            document.body.classList.add("p-overflow-hidden")
        }, delay)
    }
    // restore the user to their saved scroll position
    const restoreScrollPosition = () => {
        document.body.classList.remove("p-overflow-hidden")
        if (scrollPosition.value > 0) {
            window.scrollTo(0, parseInt(scrollPosition.value))
            scrollPosition.value = 0
        }
    }


    return { restoreScrollPosition, scrollPosition, saveScrollPosition }
}