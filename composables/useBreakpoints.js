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

    if (width < parseInt(breakpoints.xs)) return 'xs'
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
    'xs': 0,
    'sm': 1,
    'md': 2,
    'lg': 3,
    'xl': 4,
    'xxl': 5,
    'xxxl': 6
}

/**
 * Compare current breakpoint with a given condition
 * @param {string} condition - Condition like '>md', '>=lg', '<xl', '<=sm', '=md'
 * @returns {boolean} - Whether the condition is met
 */
function breakpoint(condition) {
    if (!condition || !globalBreakpoint.value) return false
    
    // Parse the condition
    const match = condition.match(/^(>=|<=|>|<|=)?(.+)$/)
    if (!match) return false
    
    const [, operator = '=', targetBreakpoint] = match
    
    // Validate target breakpoint
    if (!(targetBreakpoint in breakpointOrder)) {
        console.warn(`Invalid breakpoint: ${targetBreakpoint}`)
        return false
    }
    
    const currentOrder = breakpointOrder[globalBreakpoint.value]
    const targetOrder = breakpointOrder[targetBreakpoint]
    
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

// Global shared state and resize handler
const globalBreakpoint = ref('')
let listenerCount = 0
let isInitialized = false

const handleResize = () => {
    if (typeof window !== 'undefined') {
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
 * @returns {Object} - Reactive current breakpoint and breakpoint comparison function
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
        breakpoint,
    }
}
