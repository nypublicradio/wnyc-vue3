import type Image from './types/Image'

// calculate quality based on size multiplier
function calcQuality (quality, size) {
    const qual = size >= 2 ? quality - Math.round(size * 5) : quality
    return qual >= 15 ? qual : 15
}