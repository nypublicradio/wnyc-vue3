import axios from 'axios'

// Audio URL for a Publisher story; resolves legacy /audio/json/<id>/ player embeds (called by server/assets/widgets/ondemand_player.html)
export default defineEventHandler(async (event) => {
    const storyId: string | undefined = event?.context?.params?.storyId
    if (!/^\d+$/.test(storyId ?? '')) throw createError({ statusCode: 400, statusMessage: 'Invalid story id' })
    const config = useRuntimeConfig()
    // sparse fieldset: only the audio attribute, not the whole story
    const res = await axios(`${config.public.PUBLISHER_BASE_API}v3/story-pk/${storyId}/?fields[story]=audio`)
        .catch((error) => {
            // a deleted story just has no audio; cache that answer instead of re-asking Publisher on every view
            if (error?.response?.status === 404) return null
            throw error
        })
    // set after the fetch so other Publisher errors aren't cached
    setResponseHeader(event, 'Cache-Control', 'max-age=3600')
    // Publisher gives one URL or a list; the player takes the first. '' = no audio
    return { audio: [res?.data?.data?.attributes?.audio].flat()[0] ?? '' }
})
