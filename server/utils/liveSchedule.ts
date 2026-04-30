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

function getEpisodeStartMs (episode: ScheduleEpisode) {
    return new Date(episode?.attributes?.start || '').getTime()
}

function getEpisodeEndMs (episode: ScheduleEpisode) {
    return new Date(episode?.attributes?.end || '').getTime()
}

function hasValidTimes (episode: ScheduleEpisode) {
    return Number.isFinite(getEpisodeStartMs(episode)) &&
        Number.isFinite(getEpisodeEndMs(episode))
}
// easy BFF location to store the link to the schedule PDF
export function getSchedulePdfLink () {
    return "https://media.wnyc.org/media/resources/2025/Mar/31/wnyc-schedule.pdf"
}

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

export function getCurrentEpisodeFromSchedule (
    scheduleData: ScheduleEpisode[] | null | undefined,
    now = new Date()
) {
    return getCurrentEpisodeSelectionFromSchedule(scheduleData, now)?.episode ?? null
}
