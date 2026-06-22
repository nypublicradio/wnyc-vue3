type ScheduleEpisode = {
    attributes?: {
        start?: string
        end?: string
    }
}

type CurrentEpisodeSelection = {
    episode: ScheduleEpisode
    cacheUntilMs: number | null
}

// Get the start time of an episode in milliseconds since the epoch
function getEpisodeStartMs (episode: ScheduleEpisode) {
    return new Date(episode?.attributes?.start || '').getTime()
}

// Get the end time of an episode in milliseconds since the epoch
function getEpisodeEndMs (episode: ScheduleEpisode) {
    return new Date(episode?.attributes?.end || '').getTime()
}

// Check if an episode has valid start and end times
function hasValidTimes (episode: ScheduleEpisode) {
    return Number.isFinite(getEpisodeStartMs(episode)) &&
        Number.isFinite(getEpisodeEndMs(episode))
}

// easy BFF location to store the link to the schedule PDF
export function getSchedulePdfLink () {
    return "https://images-prod.gothamist.com/documents/WNYC_New_Schedule_June_2026.pdf"
}

// Get the current episode selection from the schedule data
export function getCurrentEpisodeSelectionFromSchedule (
    scheduleData: ScheduleEpisode[] | null | undefined,
    now = new Date()
): CurrentEpisodeSelection | null {
    if (!Array.isArray(scheduleData)) {
        return null
    }

    const nowMs = now.getTime()
    const episodes = scheduleData
        .filter(hasValidTimes)
        .sort((a, b) => getEpisodeStartMs(a) - getEpisodeStartMs(b))

    const currentEpisode = episodes.find((episode) => {
        const startMs = getEpisodeStartMs(episode)
        const endMs = getEpisodeEndMs(episode)
        return nowMs >= startMs && nowMs < endMs
    })

    if (currentEpisode) {
        return {
            episode: currentEpisode,
            cacheUntilMs: getEpisodeEndMs(currentEpisode),
        }
    }

    const previousEpisode = [...episodes].reverse().find((episode) => getEpisodeEndMs(episode) <= nowMs)
    const nextEpisode = episodes.find((episode) => getEpisodeStartMs(episode) > nowMs)

    if (previousEpisode) {
        return {
            episode: previousEpisode,
            cacheUntilMs: nextEpisode ? getEpisodeStartMs(nextEpisode) : null,
        }
    }

    if (nextEpisode) {
        return {
            episode: nextEpisode,
            cacheUntilMs: getEpisodeStartMs(nextEpisode),
        }
    }

    return null
}

// Get the current episode from the schedule data
export function getCurrentEpisodeFromSchedule (
    scheduleData: ScheduleEpisode[] | null | undefined,
    now = new Date()
) {
    return getCurrentEpisodeSelectionFromSchedule(scheduleData, now)?.episode ?? null
}
