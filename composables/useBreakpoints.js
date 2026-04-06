import { ref, onMounted, onUnmounted } from "vue"
import breakpoints from "~/assets/scss/breakpoints.module.scss"

/**
 * Get the current breakpoint based on window width
 * @param {number} width - Current window width
 * @returns {string} - Current breakpoint name
 */
function getCurrentBreakpoint (width) {
    // Handle case where width is not available or breakpoints not loaded
    if (!width || typeof breakpoints === 'undefined') {
        return 'md' // Default fallback
    }

    if (width < parseInt(breakpoints.xxs)) return 'xxs'
    if (width < parseInt(breakpoints.xs)) return 'xxs'
    if (width < parseInt(breakpoints.sm)) return 'xs'
    if (width < parseInt(breakpoints.md)) return 'sm'
    if (width < parseInt(breakpoints.lg)) return 'md'
    if (width < parseInt(breakpoints.xl)) return 'lg'
    if (width < parseInt(breakpoints.xxl)) return 'xl'
    if (width < parseInt(breakpoints.xxxl)) return 'xxl'
    return 'xxxl'
}

// Add breakpoint order mapping for comparisons
const breakpointOrder = {
    'xxs': 0,
    'xs': 1,
    'sm': 2,
    'md': 3,
    'lg': 4,
    'xl': 5,
    'xxl': 6,
    'xxxl': 7
}

// SSR-safe default breakpoint (lg = desktop, most web visitors)
const SSR_DEFAULT_BREAKPOINT = 'lg'
const SSR_DEFAULT_WIDTH = 1024

// Global shared state and resize handler
// Initialize with SSR defaults on both server and client to prevent hydration mismatches
const globalBreakpoint = ref(SSR_DEFAULT_BREAKPOINT)
const globalWindowWidth = ref(SSR_DEFAULT_WIDTH)
let listenerCount = 0
let isInitialized = false

const showOverlayBreakpoint = false
let overlayElement = null
// update the overlay styles
function updateOverlay (breakpointArg, widthArg) {
    if (!showOverlayBreakpoint || typeof document === 'undefined') return
    if (!overlayElement) {
        overlayElement = document.createElement('div')
        overlayElement.style.position = 'fixed'
        overlayElement.style.top = '0'
        overlayElement.style.left = '0'
        overlayElement.style.backgroundColor = 'black'
        overlayElement.style.color = 'white'
        overlayElement.style.padding = '8px 12px'
        overlayElement.style.zIndex = '9999999'
        overlayElement.style.fontFamily = 'monospace'
        overlayElement.style.fontSize = '14px'
        overlayElement.style.pointerEvents = 'none'
        document.body.appendChild(overlayElement)
    }
    overlayElement.textContent = `Breakpoint: ${ breakpointArg } (${ widthArg }px)`
}

/**
 * Compare current breakpoint with a given condition
 * @param {string} condition - Condition like '>md', '>=lg', '<xl', '<=sm', '=md', or pixel values '<1440', '>=1024'
 * @returns {boolean} - Whether the condition is met
 */
function breakpoint (condition) {
    if (!condition) return false

    // Parse the condition
    const match = condition.match(/^(>=|<=|>|<|=)?(.+)$/)
    if (!match) return false

    const [, operator = '=', target] = match
    const targetTrimmed = target.trim()

    // Check if it's a pixel value (e.g. "1440", "1440px")
    const pxMatch = targetTrimmed.match(/^(\d+)(px)?$/)
    if (pxMatch) {
        // If window width is not available yet, we can't determine. 
        // Defaulting to false or handling SSR might be needed, but usually this runs on client.
        if (!globalWindowWidth.value) return false

        const targetWidth = parseInt(pxMatch[1], 10)
        const currentWidth = globalWindowWidth.value

        switch (operator) {
            case '>':
                return currentWidth > targetWidth
            case '>=':
                return currentWidth >= targetWidth
            case '<':
                return currentWidth < targetWidth
            case '<=':
                return currentWidth <= targetWidth
            case '=':
            default:
                return currentWidth === targetWidth
        }
    }

    // Existing named breakpoint logic
    if (!globalBreakpoint.value) return false

    // Validate target breakpoint
    if (!(targetTrimmed in breakpointOrder)) {
        console.warn(`Invalid breakpoint: ${ targetTrimmed }`)
        return false
    }

    const currentOrder = breakpointOrder[globalBreakpoint.value]
    const targetOrder = breakpointOrder[targetTrimmed]

    switch (operator) {
        case '>':
            return currentOrder > targetOrder
        case '>=':
            return currentOrder >= targetOrder
        case '<':
            return currentOrder < targetOrder
        case '<=':
            return currentOrder <= targetOrder
        case '=':
        default:
            return currentOrder === targetOrder
    }
}
// function called on window resize to update the global breakpoint
const handleResize = () => {
    if (typeof window !== 'undefined') {
        globalWindowWidth.value = window.innerWidth
        const newBreakpoint = getCurrentBreakpoint(window.innerWidth)
        if (globalBreakpoint.value !== newBreakpoint) {
            globalBreakpoint.value = newBreakpoint
        }
        if (showOverlayBreakpoint) {
            updateOverlay(globalBreakpoint.value, globalWindowWidth.value)
        }
    }
}
// Initialize breakpoints on first mount and set up resize listener
const initializeBreakpoints = () => {
    if (typeof window !== 'undefined' && !isInitialized) {
        globalWindowWidth.value = window.innerWidth
        globalBreakpoint.value = getCurrentBreakpoint(window.innerWidth)
        window.addEventListener("resize", handleResize)
        if (showOverlayBreakpoint) {
            updateOverlay(globalBreakpoint.value, globalWindowWidth.value)
        }
        isInitialized = true
    }
}
// Cleanup function to remove resize listener on unmounted
const cleanupBreakpoints = () => {
    if (typeof window !== 'undefined' && isInitialized && listenerCount === 0) {
        window.removeEventListener("resize", handleResize)
        isInitialized = false
    }
}

/**
 * Composable for responsive breakpoint detection with shared resize listener
 * @returns {Object} - Reactive current breakpoint and breakpoint comparison function
 */
export function useBreakpoints () {
    const isMobileBreakpoint = computed(() => breakpoint("<md"))

    onMounted(() => {
        listenerCount++
        if (import.meta.client) {
            // Defer breakpoint measurement until after hydration completes
            // to prevent mismatches when Suspense boundaries resolve async components
            const nuxtApp = useNuxtApp()
            if (nuxtApp.isHydrating) {
                nuxtApp.hook('app:suspense:resolve', () => {
                    initializeBreakpoints()
                })
            } else {
                initializeBreakpoints()
            }
        }
    })

    onUnmounted(() => {
        listenerCount--
        cleanupBreakpoints()
    })

    return {
        currentBreakpoint: globalBreakpoint,
        breakpoint, isMobileBreakpoint
    }
}
