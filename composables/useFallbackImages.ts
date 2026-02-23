import {
    FALLBACKIMAGEEP,
    FALLBACKIMAGEEPDARK,
    FALLBACKIMAGEEPHEAD,
    FALLBACKIMAGEEPHEADDARK,
    FALLBACKUSER,
    FALLBACKUSERDARK,
} from '~/composables/globals'
import { useIsDarkMode } from '~/composables/states'

export const useFallbackImages = () => {
    const isDarkMode = useIsDarkMode()

    const getEpisodeFallBackImage = () => {
        return isDarkMode.value ? FALLBACKIMAGEEPDARK : FALLBACKIMAGEEP
    }

    const getEpisodeHeadFallBackImage = () => {
        return isDarkMode.value ? FALLBACKIMAGEEPHEADDARK : FALLBACKIMAGEEPHEAD
    }

    const getUserFallBackImage = () => {
        return isDarkMode.value ? FALLBACKUSERDARK : FALLBACKUSER
    }

    return {
        getEpisodeFallBackImage,
        getEpisodeHeadFallBackImage,
        getUserFallBackImage,
    }
}
