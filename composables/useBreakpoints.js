import { ref, onMounted, onUnmounted } from "vue"
import breakpoints from "~/assets/scss/breakpoints.module.scss"

/**
 * Get the current breakpoint based on window width
 * @param {number} width - Current window width
 * @returns {string} - Current breakpoint name
 */
function getCurrentBreakpoint(width) {
    // Handle case where width is not available or breakpoints not loaded
    if (!width || typeof breakpoints === 'undefined') {
        return 'md' // Default fallback
    }

    if (width < parseInt(breakpoints.xs)) return 'xs'  // Changed from 'xs-' to 'xs'
    if (width < parseInt(breakpoints.sm)) return 'xs'
    if (width < parseInt(breakpoints.md)) return 'sm'
    if (width < parseInt(breakpoints.lg)) return 'md'
    if (width < parseInt(breakpoints.xl)) return 'lg'
    if (width < parseInt(breakpoints.xxl)) return 'xl'
    if (width < parseInt(breakpoints.xxxl)) return 'xxl'
    return 'xxxl'
}

// Global shared state and resize handler
let globalBreakpoint = ref('')
let listenerCount = 0
let isInitialized = false

const handleResize = () => {
    if (typeof window !== 'undefined') {
        console.log("Resize detected, width:", window.innerWidth)  // Debug log to trace resize events
        const newBreakpoint = getCurrentBreakpoint(window.innerWidth)
        if (globalBreakpoint.value !== newBreakpoint) {
            globalBreakpoint.value = newBreakpoint
        }
    }
}

const initializeBreakpoints = () => {
    if (typeof window !== 'undefined' && !isInitialized) {
        globalBreakpoint.value = getCurrentBreakpoint(window.innerWidth)
        window.addEventListener("resize", handleResize)
        isInitialized = true
    }
}

const cleanupBreakpoints = () => {
    if (typeof window !== 'undefined' && isInitialized && listenerCount === 0) {
        window.removeEventListener("resize", handleResize)
        isInitialized = false
    }
}

/**
 * Composable for responsive breakpoint detection with shared resize listener
 * @returns {Object} - Reactive current breakpoint
 */
export function useBreakpoints() {
    onMounted(() => {
        listenerCount++
        initializeBreakpoints()
    })

    onUnmounted(() => {
        listenerCount--
        cleanupBreakpoints()
    })

    return {
        currentBreakpoint: globalBreakpoint,
    }
}
