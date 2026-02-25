import {
    FALLBACKIMAGEEP,
    FALLBACKIMAGEEPDARK,
    FALLBACKIMAGEEPHEAD,
    FALLBACKIMAGEEPHEADDARK,
    FALLBACKUSER,
    FALLBACKUSERDARK,
} from '~/composables/globals'
import { useIsDarkMode } from '~/composables/states'
// composable that will return the correct fallback image depending on dark mode
export const useFallbackImages = () => {
    const isDarkMode = useIsDarkMode()
    // depending on dark mode return the correct episode fallback image
    const getEpisodeFallBackImage = () => {
        return isDarkMode.value ? FALLBACKIMAGEEPDARK : FALLBACKIMAGEEP
    }
    // depending on dark mode return the correct episode head fallback image
    const getEpisodeHeadFallBackImage = () => {
        return isDarkMode.value ? FALLBACKIMAGEEPHEADDARK : FALLBACKIMAGEEPHEAD
    }
    // depending on dark mode return the correct user fallback image
    const getUserFallBackImage = () => {
        return isDarkMode.value ? FALLBACKUSERDARK : FALLBACKUSER
    }

    return {
        getEpisodeFallBackImage,
        getEpisodeHeadFallBackImage,
        getUserFallBackImage,
    }
}
