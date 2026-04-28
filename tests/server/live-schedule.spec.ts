import { describe, expect, it } from 'vitest'
import { getCurrentEpisodeSelectionFromSchedule } from '../../server/utils/liveSchedule'

const episode = (id: string, start: string, end: string) => ({
  id,
  attributes: {
    start,
    end,
    parentTitle: id,
  },
})

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

  it('does not bridge long gaps', () => {
    const selection = getCurrentEpisodeSelectionFromSchedule(
      [
        episode('Previous Show', '2026-04-28T10:00:00Z', '2026-04-28T11:00:00Z'),
        episode('Next Show', '2026-04-28T13:00:00Z', '2026-04-28T14:00:00Z'),
      ],
      new Date('2026-04-28T12:54:00Z')
    )

    expect(selection?.episode.id).toBe('Next Show')
    expect(selection?.cacheUntilMs).toBe(new Date('2026-04-28T13:00:00Z').getTime())
  })
})
