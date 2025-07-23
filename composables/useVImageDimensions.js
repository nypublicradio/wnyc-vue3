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
export function useVImageDimensions(options = {}) {
    const { size = {} } = options

    // Use the shared breakpoint composable
    const { currentBreakpoint } = useBreakpoints()

    const width = ref(0)
    const height = ref(0)

    // Track the maximum dimensions and current aspect ratio
    const maxWidth = ref(0)
    const maxHeight = ref(0)
    const currentRatio = ref(0)

    // Calculate aspect ratio with tolerance for comparison
    const calculateRatio = (w, h) => w / h
    const ratiosAreEqual = (ratio1, ratio2, tolerance = 0.1) => {
        return Math.abs(ratio1 - ratio2) <= tolerance
    }

    // Update dimensions based on current breakpoint
    const updateDimensions = () => {
        const [newWidth, newHeight] = getSizeForBreakpoint(size, currentBreakpoint.value)
        const newRatio = calculateRatio(newWidth, newHeight)

        // Check if we need to update based on:
        // 1. Larger dimensions (prevents unnecessary refetching when scaling down)
        // 2. Different aspect ratio (handles cases where crop/ratio changes significantly)
        const isLargerSize = newWidth > maxWidth.value || newHeight > maxHeight.value
        const isDifferentRatio = !ratiosAreEqual(newRatio, currentRatio.value)

        const shouldUpdate = isLargerSize || isDifferentRatio

        if (shouldUpdate) {
            // For different ratios, use the new dimensions even if smaller
            // For larger sizes, use the maximum dimensions
            if (isDifferentRatio) {
                width.value = newWidth
                height.value = newHeight
                // Update max dimensions if the new ones are larger
                maxWidth.value = Math.max(newWidth, maxWidth.value)
                maxHeight.value = Math.max(newHeight, maxHeight.value)
            } else {
                // Same ratio, just use larger dimensions
                const finalWidth = Math.max(newWidth, maxWidth.value)
                const finalHeight = Math.max(newHeight, maxHeight.value)

                width.value = finalWidth
                height.value = finalHeight
                maxWidth.value = finalWidth
                maxHeight.value = finalHeight
            }

            currentRatio.value = newRatio
        }
    }

    // Watch for breakpoint changes and update dimensions
    watch(currentBreakpoint, updateDimensions, { immediate: true })

    return {
        width,
        height,
        currentBreakpoint,
    }
}
