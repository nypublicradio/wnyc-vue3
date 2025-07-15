import { ref, watch } from "vue"
import { useBreakpoints } from "~/composables/useBreakpoints"

/**
 * Get the size for the current breakpoint with smart defaults
 * @param {Object|Array} sizeConfig - Size configuration object or legacy array
 * @param {string} breakpoint - Current breakpoint name
 * @returns {Array} - [width, height] size array for the current breakpoint
 */
function getSizeForBreakpoint(sizeConfig, breakpoint) {
    // Handle legacy array format for backward compatibility (convert to ratio)
    if (Array.isArray(sizeConfig)) {
        // Convert ratio to a reasonable default size (112px width base)
        const ratio = sizeConfig[0] / sizeConfig[1]
        const width = 112
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
        return [112, 112] // Default 1:1 ratio at 112px width
    }

    // Fallback to default
    return [112, 112]
}

/**
 * Composable for responsive image dimensions based on breakpoint-specific sizes
 * @param {Object} options - Configuration options
 * @param {Object|Array} options.size - Responsive size configuration:
 *   - Object format: { xs: [112,112], md: [600,400] } - different sizes per breakpoint
 *   - Array format (legacy): [3, 2] - converted to ratio-based default size
 *   - Default: {} (uses [300,200] default size)
 * @returns {Object} - Reactive width, height, and current breakpoint
 */
export function useImageDimensions(options = {}) {
    const { size = {} } = options

    // Use the shared breakpoint composable
    const { currentBreakpoint } = useBreakpoints()

    const width = ref(0)
    const height = ref(0)

    // Update dimensions based on current breakpoint
    const updateDimensions = () => {
        const [newWidth, newHeight] = getSizeForBreakpoint(size, currentBreakpoint.value)
        width.value = newWidth
        height.value = newHeight
    }

    // Watch for breakpoint changes and update dimensions
    watch(currentBreakpoint, updateDimensions, { immediate: true })

    return {
        width,
        height,
        currentBreakpoint,
    }
}
