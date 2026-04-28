export const LIVE_SCHEDULE_LOOKBACK_MINUTES = 15

const LIVE_SCHEDULE_LOOKBACK_MS = LIVE_SCHEDULE_LOOKBACK_MINUTES * 60 * 1000

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

const getEpisodeStartMs = (episode: ScheduleEpisode) => new Date(episode?.attributes?.start || '').getTime()
const getEpisodeEndMs = (episode: ScheduleEpisode) => new Date(episode?.attributes?.end || '').getTime()

const hasValidTimes = (episode: ScheduleEpisode) => (
    Number.isFinite(getEpisodeStartMs(episode)) &&
    Number.isFinite(getEpisodeEndMs(episode))
)

export const getCurrentEpisodeSelectionFromSchedule = (
    scheduleData: ScheduleEpisode[] | null | undefined,
    now = new Date(),
    gapGraceMs = LIVE_SCHEDULE_LOOKBACK_MS
): CurrentEpisodeSelection | null => {
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

    if (previousEpisode && nextEpisode) {
        const previousEndMs = getEpisodeEndMs(previousEpisode)
        const nextStartMs = getEpisodeStartMs(nextEpisode)
        const gapMs = nextStartMs - previousEndMs

        if (nowMs >= previousEndMs && nowMs < nextStartMs && gapMs > 0 && gapMs <= gapGraceMs) {
            return {
                episode: previousEpisode,
                cacheUntilMs: nextStartMs,
            }
        }
    }

    if (previousEpisode) {
        const previousEndMs = getEpisodeEndMs(previousEpisode)
        if (nowMs - previousEndMs <= gapGraceMs) {
            return {
                episode: previousEpisode,
                cacheUntilMs: null,
            }
        }
    }

    if (nextEpisode) {
        const nextStartMs = getEpisodeStartMs(nextEpisode)
        return {
            episode: nextEpisode,
            cacheUntilMs: nextStartMs > nowMs ? nextStartMs : getEpisodeEndMs(nextEpisode),
        }
    }

    return null
}

export const getCurrentEpisodeFromSchedule = (
    scheduleData: ScheduleEpisode[] | null | undefined,
    now = new Date(),
    gapGraceMs = LIVE_SCHEDULE_LOOKBACK_MS
) => getCurrentEpisodeSelectionFromSchedule(scheduleData, now, gapGraceMs)?.episode ?? null
