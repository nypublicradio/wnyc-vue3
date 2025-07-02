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

/**
 * Get the size for the current breakpoint with smart defaults
 * @param {Object|Array} sizeConfig - Size configuration object or legacy array
 * @param {string} breakpoint - Current breakpoint name
 * @returns {Array} - [width, height] size array for the current breakpoint
 */
function getSizeForBreakpoint(sizeConfig, breakpoint) {
    // Handle legacy array format for backward compatibility (convert to ratio)
    if (Array.isArray(sizeConfig)) {
        // Convert ratio to a reasonable default size (300px width base)
        const ratio = sizeConfig[0] / sizeConfig[1]
        const width = 300
        const height = Math.round(width / ratio)
        return [width, height]
    }

    // Handle object format with smart cascading defaults
    if (sizeConfig && typeof sizeConfig === 'object') {
        const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl', 'xxxl']
        const currentIndex = breakpointOrder.indexOf(breakpoint)

        // Look for the size at current breakpoint or cascade down to find the closest defined size
        for (let i = currentIndex; i >= 0; i--) {
            const bp = breakpointOrder[i]
            if (sizeConfig[bp]) {
                return sizeConfig[bp]
            }
        }

        // If no size found, use default
        return [300, 200] // Default 3:2 ratio at 300px width
    }

    // Fallback to default
    return [300, 200]
}

/**
 * Composable for responsive image dimensions based on breakpoint-specific sizes
 * @param {Object} options - Configuration options
 * @param {Object|Array} options.size - Responsive size configuration:
 *   - Object format: { xs: [116,116], md: [600,400] } - different sizes per breakpoint
 *   - Array format (legacy): [3, 2] - converted to ratio-based default size
 *   - Default: {} (uses [300,200] default size)
 * @returns {Object} - Reactive width, height, and current breakpoint
 */
export function useImageDimensions(options = {}) {
    const { size = {} } = options

    const width = ref(0)
    const height = ref(0)
    const currentBreakpoint = ref('')

    // Update dimensions based on current breakpoint
    const updateDimensions = () => {
        const [newWidth, newHeight] = getSizeForBreakpoint(size, currentBreakpoint.value)
        width.value = newWidth
        height.value = newHeight
    }

    // Handle window resize with minimal debouncing
    const handleResize = () => {
        if (typeof window !== 'undefined') {
            const newBreakpoint = getCurrentBreakpoint(window.innerWidth)
            if (currentBreakpoint.value !== newBreakpoint) {
                currentBreakpoint.value = newBreakpoint
                updateDimensions()
            }
        }
    }

    onMounted(() => {
        if (typeof window !== 'undefined') {
            // Initialize current breakpoint and dimensions
            currentBreakpoint.value = getCurrentBreakpoint(window.innerWidth)
            updateDimensions()

            // Set up resize listener
            window.addEventListener("resize", handleResize)
        }
    })

    onUnmounted(() => {
        if (typeof window !== 'undefined') {
            window.removeEventListener("resize", handleResize)
        }
    })

    return {
        width,
        height,
        currentBreakpoint,
    }
}
