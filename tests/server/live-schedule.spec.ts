import { describe, expect, it } from 'vitest'
import { getCurrentEpisodeSelectionFromSchedule } from '../../server/utils/liveSchedule'

function episode (id: string, start: string, end: string) {
  return {
    id,
    attributes: {
      start,
      end,
      parentTitle: id,
    },
  }
}

describe('live schedule episode selection', () => {
  it('keeps the just-ended episode during a short schedule gap', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [
        episode('Morning Edition', '2026-04-28T11:00:00Z', '2026-04-28T12:50:00Z'),
        episode('BBC World Service', '2026-04-28T13:00:00Z', '2026-04-28T13:59:00Z'),
      ],
      new Date('2026-04-28T12:54:00Z')
    )

    expect(selection?.episode.id).toBe('Morning Edition')
    expect(selection?.cacheUntilMs).toBe(new Date('2026-04-28T13:00:00Z').getTime())
  })

  it('switches to the next episode once it actually starts', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [
        episode('Morning Edition', '2026-04-28T11:00:00Z', '2026-04-28T12:50:00Z'),
        episode('BBC World Service', '2026-04-28T13:00:00Z', '2026-04-28T13:59:00Z'),
      ],
      new Date('2026-04-28T13:00:00Z')
    )

    expect(selection?.episode.id).toBe('BBC World Service')
    expect(selection?.cacheUntilMs).toBe(new Date('2026-04-28T13:59:00Z').getTime())
  })

  it('keeps the previous episode during a long schedule gap', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [
        episode('Previous Show', '2026-04-28T10:00:00Z', '2026-04-28T11:00:00Z'),
        episode('Next Show', '2026-04-28T13:00:00Z', '2026-04-28T14:00:00Z'),
      ],
      new Date('2026-04-28T12:54:00Z')
    )

    expect(selection?.episode.id).toBe('Previous Show')
    expect(selection?.cacheUntilMs).toBe(new Date('2026-04-28T13:00:00Z').getTime())
  })

  it('returns the currently airing episode when one exists', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [
        episode('Previous Show', '2026-04-28T10:00:00Z', '2026-04-28T11:00:00Z'),
        episode('Current Show', '2026-04-28T12:00:00Z', '2026-04-28T13:00:00Z'),
        episode('Next Show', '2026-04-28T13:00:00Z', '2026-04-28T14:00:00Z'),
      ],
      new Date('2026-04-28T12:30:00Z')
    )

    expect(selection?.episode.id).toBe('Current Show')
    expect(selection?.cacheUntilMs).toBe(new Date('2026-04-28T13:00:00Z').getTime())
  })

  it('returns null for an empty schedule', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [],
      new Date('2026-04-28T12:30:00Z')
    )

    expect(selection).toBeNull()
  })

  it('keeps the previous episode with no cache boundary when no next episode exists', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [
        episode('Previous Show', '2026-04-28T10:00:00Z', '2026-04-28T11:00:00Z'),
      ],
      new Date('2026-04-28T12:30:00Z')
    )

    expect(selection?.episode.id).toBe('Previous Show')
    expect(selection?.cacheUntilMs).toBeNull()
  })
})
