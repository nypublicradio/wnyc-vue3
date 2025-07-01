import { ref, onMounted, onUnmounted, nextTick, computed } from "vue"
import breakpoints from "~/assets/scss/breakpoints.module.scss"

/**
 * Get the current breakpoint based on window width
 * @param {number} width - Current window width
 * @returns {string} - Current breakpoint name
 */
function getCurrentBreakpoint(width) {
    if (width < parseInt(breakpoints.xs)) return 'xs-'
    if (width < parseInt(breakpoints.sm)) return 'xs'
    if (width < parseInt(breakpoints.md)) return 'sm'
    if (width < parseInt(breakpoints.lg)) return 'md'
    if (width < parseInt(breakpoints.xl)) return 'lg'
    if (width < parseInt(breakpoints.xxl)) return 'xl'
    if (width < parseInt(breakpoints.xxxl)) return 'xxl'
    return 'xxxl'
}

/**
 * Composable for dynamically calculating image dimensions based on container size and aspect ratio
 * @param {Object} options - Configuration options
 * @param {Array} options.ratio - Aspect ratio as [width, height] (e.g., [3, 2])
 * @param {string} options.containerSelector - CSS selector for the container element
 * @param {number} options.debounceDelay - Delay in milliseconds for debouncing resize events (default: 150)
 * @returns {Object} - Reactive width, height, and utility functions
 */
export function useImageDimensions(options = {}) {
    const { ratio = [3, 2], containerSelector = ".image", debounceDelay = 500 } = options

    const width = ref(0)
    const height = ref(0)
    const containerElement = ref(null)
    const currentBreakpoint = ref('')

    // Return the original ratio array for reactivity
    const reactiveRatio = computed(() => ratio)

    let resizeObserver = null
    let debounceTimer = null

    // Check if we've entered a different breakpoint
    const hasBreakpointChanged = () => {
        const windowWidth = window.innerWidth
        const newBreakpoint = getCurrentBreakpoint(windowWidth)

        if (currentBreakpoint.value !== newBreakpoint) {
            currentBreakpoint.value = newBreakpoint
            return true
        }
        return false
    }

    // Debounced version of calculateDimensions - only updates on breakpoint changes
    const debouncedCalculateDimensions = () => {
        if (debounceTimer) {
            clearTimeout(debounceTimer)
        }
        debounceTimer = setTimeout(() => {
            // Only recalculate if we've crossed a breakpoint boundary
            if (hasBreakpointChanged()) {
                calculateDimensions()
            }
            debounceTimer = null
        }, debounceDelay)
    }

    const calculateDimensions = () => {
        if (!containerElement.value) return

        const containerRect = containerElement.value.getBoundingClientRect()
        const containerWidth = containerRect.width
        const containerHeight = containerRect.height

        if (containerWidth === 0 || containerHeight === 0) return

        const aspectRatio = ratio[0] / ratio[1]

        // Calculate dimensions based on container size while maintaining aspect ratio
        if (containerWidth / containerHeight > aspectRatio) {
            // Container is wider than aspect ratio, fit to height
            height.value = Math.round(containerHeight)
            width.value = Math.round(containerHeight * aspectRatio)
        } else {
            // Container is taller than aspect ratio, fit to width
            width.value = Math.round(containerWidth)
            height.value = Math.round(containerWidth / aspectRatio)
        }
    }

    const findContainer = () => {
        // Handle different types of container selectors
        if (typeof containerSelector === "function") {
            return containerSelector()
        } else if (typeof containerSelector === "string") {
            if (typeof document !== "undefined") {
                const containers = document.querySelectorAll(containerSelector)
                if (containers.length === 1) {
                    return containers[0]
                } else if (containers.length > 1) {
                    // If multiple containers, try to find the most recent one or use the first
                    return containers[containers.length - 1]
                }
            }
        } else if (containerSelector?.value) {
            return containerSelector.value
        }
        return null
    }

    const initializeObserver = async () => {
        await nextTick()

        // Find the container element
        containerElement.value = findContainer()

        if (!containerElement.value) {
            console.warn(`Container element not found with selector: ${containerSelector}`)
            return
        }

        // Set initial breakpoint
        currentBreakpoint.value = getCurrentBreakpoint(window.innerWidth)

        // Initial calculation
        calculateDimensions()

        // Set up ResizeObserver to watch for container size changes
        if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target === containerElement.value) {
                        debouncedCalculateDimensions()
                    }
                }
            })

            resizeObserver.observe(containerElement.value)
        } else {
            // Fallback for browsers without ResizeObserver
            window.addEventListener("resize", debouncedCalculateDimensions)
        }
    }

    const cleanup = () => {
        // Clear any pending debounce timer
        if (debounceTimer) {
            clearTimeout(debounceTimer)
            debounceTimer = null
        }

        if (resizeObserver) {
            resizeObserver.disconnect()
            resizeObserver = null
        } else {
            window.removeEventListener("resize", debouncedCalculateDimensions)
        }
    }

    onMounted(() => {
        initializeObserver()
    })

    onUnmounted(() => {
        cleanup()
    })

    return {
        width,
        height,
        ratio: reactiveRatio,
        currentBreakpoint,
        calculateDimensions,
        cleanup,
    }
}
